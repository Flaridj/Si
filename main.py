import discord
from discord.ext import commands, tasks
import asyncio
import json
import os

# ---------------- CONFIG ----------------

TOKEN = "MTM5MDI5MjIwODk4MDMzMjY0NA.G7RDEC.8-lzGkjl1WKevpju7L5ZoVgEuPjjU6mVREdnaY"  # Remplace par ton vrai token
OWNER_ID = 1254402109563076722  # Ton ID

CHANNEL_GRAB_ID = 1394934725738631209
CHANNEL_VALIDATION_ID = 1394934744541691975
CHANNEL_LEADERBOARD_ID = 1393897776844247140

intents = discord.Intents.all()
bot = commands.Bot(command_prefix="?", intents=intents)

whitelisted_users = set()
user_points = {}

if os.path.exists("points.json"):
    with open("points.json", "r") as f:
        user_points = json.load(f)

# ---------------- EVENTS ----------------

@bot.event
async def on_ready():
    print(f"Connecté en tant que {bot.user}")
    leaderboard_loop.start()
    await send_grab_embed()

async def send_grab_embed():
    channel = bot.get_channel(CHANNEL_GRAB_ID)
    if not channel:
        return

    server = channel.guild
    embed = discord.Embed(
        title="Obtenez Vos point de vos grab quotidiens",
        description="Cliquez sur le bouton ci-dessous",
        color=0x1e1e1e
    )
    embed.set_footer(text=server.name, icon_url=server.icon.url if server.icon else None)
    view = GrabView()
    await channel.send(embed=embed, view=view)

# ---------------- LOOP ----------------

@tasks.loop(seconds=60)
async def leaderboard_loop():
    channel = bot.get_channel(CHANNEL_LEADERBOARD_ID)
    if not channel:
        return

    leaderboard = sorted(user_points.items(), key=lambda x: x[1], reverse=True)[:10]
    desc = ""
    for i, (uid, points) in enumerate(leaderboard, start=1):
        user = bot.get_user(int(uid))
        name = user.name if user else f"<@{uid}>"
        desc += f"Top {i} - {name} ({points} grabs)\n"

    embed = discord.Embed(
        title="Leaderboard des Grabs",
        description=desc if desc else "Aucun grab enregistré.",
        color=0x1e1e1e
    )
    embed.set_footer(text=channel.guild.name, icon_url=channel.guild.icon.url)

    messages = [msg async for msg in channel.history(limit=1)]
    if messages:
        await messages[0].edit(embed=embed)
    else:
        await channel.send(embed=embed)

# ---------------- VIEWS ----------------

class GrabView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Grab", style=discord.ButtonStyle.gray, custom_id="grab_button")
    async def grab(self, interaction: discord.Interaction, button: discord.ui.Button):
        try:
            await interaction.user.send("Merci. Veuillez envoyer votre preuve (image) **dans le salon** où vous avez cliqué sur Grab.")
            await interaction.response.send_message("Je vous ai envoyé un message privé. Vérifiez vos MP.", ephemeral=True)
        except discord.Forbidden:
            await interaction.response.send_message("Je ne peux pas vous envoyer de MP. Active tes messages privés.", ephemeral=True)

class ValidationView(discord.ui.View):
    def __init__(self, user_id, image_url):
        super().__init__(timeout=None)
        self.user_id = user_id
        self.image_url = image_url

    @discord.ui.button(label="Accepter", style=discord.ButtonStyle.green)
    async def accept(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not await is_whitelisted(interaction.user):
            return await interaction.response.send_message("Tu n'as pas la permission.", ephemeral=True)

        user = bot.get_user(self.user_id)
        user_points[str(self.user_id)] = user_points.get(str(self.user_id), 0) + 1
        save_points()

        await user.send(embed=discord.Embed(
            title="Votre grab a été accepté.",
            color=0x1e1e1e
        ).set_footer(text=interaction.guild.name, icon_url=interaction.guild.icon.url))

        await interaction.response.send_message("Grab accepté.", ephemeral=True)

    @discord.ui.button(label="Refuser", style=discord.ButtonStyle.gray)
    async def deny(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not await is_whitelisted(interaction.user):
            return await interaction.response.send_message("Tu n'as pas la permission.", ephemeral=True)

        await interaction.response.send_message("Grab refusé.", ephemeral=True)

# ---------------- COMMANDES ----------------

@bot.command(name="wl")
async def wl(ctx, member: discord.Member):
    if ctx.author.id != OWNER_ID:
        return await ctx.send("Commande réservée au propriétaire.")

    whitelisted_users.add(member.id)
    await ctx.send(f"{member.mention} a été ajouté à la whitelist.")

@bot.command(name="solde")
async def solde(ctx):
    user_id = str(ctx.author.id)
    total = user_points.get(user_id, 0)

    embed = discord.Embed(
        title="Votre nombre de grabs",
        description=f"Vous avez actuellement {total} grabs.",
        color=0x1e1e1e
    )
    embed.set_footer(text=ctx.guild.name, icon_url=ctx.guild.icon.url if ctx.guild.icon else None)
    await ctx.send(embed=embed)

@bot.command(name="top")
async def top(ctx):
    leaderboard = sorted(user_points.items(), key=lambda x: x[1], reverse=True)[:10]
    if not leaderboard:
        return await ctx.send("Aucun grab enregistré pour l’instant.")

    desc = ""
    for i, (uid, points) in enumerate(leaderboard, start=1):
        user = bot.get_user(int(uid))
        name = user.name if user else f"<@{uid}>"
        desc += f"Top {i} - {name} : {points} grabs\n"

    embed = discord.Embed(
        title="Leaderboard des Grabs",
        description=desc,
        color=0x1e1e1e
    )
    embed.set_footer(text=ctx.guild.name, icon_url=ctx.guild.icon.url if ctx.guild.icon else None)

    await ctx.send(embed=embed)

@bot.command(name="resetpoints")
async def resetpoints(ctx, member: discord.Member = None):
    if ctx.author.id != OWNER_ID:
        return await ctx.send("Commande réservée au propriétaire.")

    if member is None:
        member = ctx.author

    uid = str(member.id)
    if uid in user_points:
        user_points[uid] = 0
        save_points()
        await ctx.send(f"Les points de {member.mention} ont été réinitialisés.")
    else:
        await ctx.send(f"{member.mention} n'a aucun point enregistré.")

# ---------------- UTILS ----------------

async def is_whitelisted(user):
    return user.id in whitelisted_users or user.id == OWNER_ID

def save_points():
    with open("points.json", "w") as f:
        json.dump(user_points, f, indent=4)

# ---------------- START ----------------

bot.run(TOKEN)
