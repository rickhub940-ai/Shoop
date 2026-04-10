import discord
from discord import app_commands
import json, os, re, cloudscraper

token = "MTQ4NDkyNTk5ODE0NjUxOTMyMA.G0mY_L.Wh1FMRy_dFGpt7XjimYIfhZerAL7VYIxNGP3Ao" ## token bot discord
_p = "0984839629" ## number phone redeem money krb
_url = "" ## links im embed kub

admin = [1426272052117241913] ## id user admin id profile you 

scraper = cloudscraper.create_scraper()

intents = discord.Intents.default()
intents.message_content = True

bot = discord.Client(intents=intents)
tree = app_commands.CommandTree(bot)

def load_json(file, default={}):
    if not os.path.exists(file):
        with open(file, "w") as f:
            json.dump(default, f)
    with open(file, "r") as f:
        return json.load(f)

def save_json(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

def is_admin(uid):
    return uid in admin

def get_user(uid):
    db = load_json("users.json", {})
    return db.get(str(uid), {"point": 0})

def save_user(uid, data):
    db = load_json("users.json", {})
    db[str(uid)] = data
    save_json("users.json", db)

def add_money(uid, amount):
    user = get_user(uid)
    user["point"] += int(amount)
    save_user(uid, user)
    return user

def get_stock(day):
    data = load_json("keys.json", {})
    return len(data.get(day, []))

def _local(code, phone):
    api_url = f"https://store.cyber-safe.pro/api/topup/truemoney/angpaofree/{code}/{phone}"
    try:
        resp = scraper.get(api_url, timeout=12)
        data = resp.json()
    except:
        return {"success": False, "amount": 0}
    ticket = data.get("data", {}).get("my_ticket") or {}
    try:
        amount = int(float(ticket.get("amount_baht", 0) or 0))
    except:
        amount = 0
    if amount > 0:
        return {"success": True, "amount": amount}
    return {"success": False, "amount": 0}

def extract_code(text):
    m = re.search(r'gift\.truemoney\.com.*?=([A-Za-z0-9]+)', text)
    return m.group(1) if m else None

def build_embed():
    embed = discord.Embed(
        title="Shop Buy key 24h",
        description=(
            f"```stock 1 days``` | {get_stock('1')} keys\n"
            f"```stock 7 days``` | {get_stock('7')} keys\n"
            f"```stock ถาวร``` | {get_stock('0')} keys"
        ),
        color=0x2F3136
    )
    embed.set_image(url=_url)
    return embed

class ShopSelect(discord.ui.Select):
    def __init__(self):
        prices = load_json("prices.json", {})
        options = [
            discord.SelectOption(label=f"1 วัน ({prices.get('1',0)}฿)", value="1"),
            discord.SelectOption(label=f"7 วัน ({prices.get('7',0)}฿)", value="7"),
            discord.SelectOption(label=f"ถาวร ({prices.get('0',0)}฿)", value="0"),
        ]
        super().__init__(placeholder="Select buy", options=options, custom_id="shop_select")

    async def callback(self, interaction: discord.Interaction):
        day = self.values[0]
        prices = load_json("prices.json", {})
        price = int(prices.get(day, 0))
        user = get_user(interaction.user.id)
        balance = int(user.get("point", 0))
        if balance < price:
            return await interaction.response.send_message(f"เงินไม่พอ ({balance}/{price})", ephemeral=True)
        data = load_json("keys.json", {})
        stock = data.get(day, [])
        if not stock:
            return await interaction.response.send_message("ของหมด", ephemeral=True)
        key = stock.pop(0)
        user["point"] = balance - price
        save_user(interaction.user.id, user)
        data[day] = stock
        save_json("keys.json", data)
        try:
            await interaction.user.send(f"🔑 Key ของคุณ:\n`{key}`")
            msg = "ซื้อคีย์สำเร็จ โปรดเช็ค DM"
        except:
            msg = f"ซื้อสำเร็จ แต่ DM ไม่ได้\n🔑 `{key}`"
        await interaction.response.send_message(msg, ephemeral=True)
        await interaction.message.edit(embed=build_embed(), view=ShopView())

class ShopView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)
        self.add_item(ShopSelect())
        self.add_item(discord.ui.Button(label="Refresh", style=discord.ButtonStyle.gray, custom_id="refresh_btn"))
        self.add_item(discord.ui.Button(label="Topup", style=discord.ButtonStyle.green, custom_id="topup_btn"))
        self.add_item(discord.ui.Button(label="Check Balance", style=discord.ButtonStyle.blurple, custom_id="balance_btn"))

    async def interaction_check(self, interaction: discord.Interaction):
        cid = interaction.data["custom_id"]

        if cid == "refresh_btn":
            await interaction.response.edit_message(embed=build_embed(), view=ShopView())
            return False

        if cid == "balance_btn":
            await interaction.response.defer(ephemeral=True)
            user = get_user(interaction.user.id)
            await interaction.followup.send(f"**เงินคุณมี** {user['point']} บาท", ephemeral=True)
            return False

        if cid == "topup_btn":
            modal = discord.ui.Modal(title="Topup")
            link = discord.ui.TextInput(label="ลิงก์อั่งเปา", required=True)
            modal.add_item(link)

            async def submit(i):
                await i.response.defer(ephemeral=True)
                code = extract_code(link.value)
                if not code:
                    return await i.followup.send("ลิงก์ไม่ถูกต้อง", ephemeral=True)
                r = _local(code, _p)
                if not r["success"]:
                    return await i.followup.send("เติมไม่สำเร็จ", ephemeral=True)
                user = add_money(i.user.id, int(r["amount"]))
                await i.followup.send(f"+{int(r['amount'])} บาท | 💰 {user['point']}", ephemeral=True)
                await interaction.message.edit(embed=build_embed(), view=ShopView())

            modal.on_submit = submit
            await interaction.response.send_modal(modal)
            return False

        return True

@tree.command(name="setup")
async def setup(interaction: discord.Interaction):
    if not is_admin(interaction.user.id):
        return await interaction.response.send_message("no role admin", ephemeral=True)
    await interaction.channel.send(embed=build_embed(), view=ShopView())
    await interaction.response.send_message("setup", ephemeral=True)

@tree.command(name="addkey")
async def addkey(interaction: discord.Interaction, day: str, file: discord.Attachment):
    if not is_admin(interaction.user.id):
        return await interaction.response.send_message("no role admin", ephemeral=True)
    data = load_json("keys.json", {})
    content = await file.read()
    keys = [k.strip() for k in content.decode().splitlines() if k.strip()]
    if day not in data:
        data[day] = []
    data[day].extend(keys)
    save_json("keys.json", data)
    await interaction.response.send_message(f"เพิ่ม {len(keys)} keys | stock {len(data[day])}", ephemeral=True)

@tree.command(name="setprice")
async def setprice(interaction: discord.Interaction, day: str, price: int):
    if not is_admin(interaction.user.id):
        return await interaction.response.send_message("no role admin", ephemeral=True)
    data = load_json("prices.json", {})
    data[day] = int(price)
    save_json("prices.json", data)
    await interaction.response.send_message(f"{day} = {price}", ephemeral=True)

@bot.event
async def on_ready():
    bot.add_view(ShopView())
    await tree.sync()
    print("ready")

bot.run(token)
