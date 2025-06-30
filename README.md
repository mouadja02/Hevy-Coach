# 🏋️ Hevy Coach - AI-Powered Workout Analyzer

Transform your Hevy workout data into personalized coaching advice! This project automatically analyzes your workout CSV exports and provides AI-powered recommendations via Telegram.

![Project Demo](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen) ![Difficulty](https://img.shields.io/badge/Difficulty-Beginner%20Friendly-blue) ![Platform](https://img.shields.io/badge/Platform-n8n-orange)

## What Does This Do?

**Simple Version**: Send your Hevy workout CSV to a Telegram bot → Get AI coaching advice + progress charts back!

**Detailed Version**: 
- 📊 Analyzes your workout data automatically
- 🤖 Provides personalized coaching recommendations using AI
- 📈 Creates progress charts for your top exercises
- 💬 Sends everything directly to your Telegram
- 🔄 Works every time you export data from Hevy

## Quick Start (5 Minutes Setup)

### Step 1: Install n8n
Choose one option:

**Option A: Docker (Recommended)**
```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

**Option B: npm**
```bash
npm install n8n -g
n8n start
```

**Option C: Desktop App**
Download from [n8n.io](https://n8n.io/download/)

### Step 2: Access n8n
Open your browser and go to: `http://localhost:5678`

### Step 3: Create Your Workflow
1. Click "**+ Add Workflow**"
2. Follow the setup guide below 👇

## Complete Setup Guide

### 1. Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Send** `/newbot` to BotFather
3. **Choose a name** for your bot (e.g., "My Workout Coach")
4. **Choose a username** (e.g., "my_workout_coach_bot")
5. **Save the API token** - you'll need it in n8n!

### 2. Build Your n8n Workflow

Your workflow will have **5 simple nodes**:

```
📱 Telegram Trigger → 📄 Extract File → 💻 Code → 🤖 AI Agent → 📱 Telegram Send
```

#### Node 1: Telegram Trigger
1. **Add node**: Search "Telegram Trigger"
2. **Credentials**: Add your bot token from Step 1
3. **Settings**: 
   - Trigger on: `message`
   - Download attachments: `✅ Yes`

#### Node 2: Extract from File
1. **Add node**: Search "Extract from File"
2. **Settings**:
   - File format: `CSV`
   - Options: Leave default

#### Node 3: Code Node (The Magic Happens Here!)
1. **Add node**: Search "Code"
2. **Copy and paste** the entire code from `n8n_code_node.js`
3. **That's it!** The code is fully documented and ready to use

#### Node 4: AI Agent
1. **Add node**: Search "AI Agent" or "OpenAI"
2. **Credentials**: Add your AI service API key (OpenAI, DeepSeek, etc.)
3. **Settings**:
   - Model: `gpt-4` or `deepseek-chat`
   - System message: Copy from the system message section below
   - User message: `{{ $('Code').first().json.aiPrompt }}`

#### Node 5: Telegram Send
1. **Add node**: Search "Telegram"
2. **Credentials**: Same as Telegram Trigger
3. **Settings**:
   - Chat ID: `{{ $('Telegram Trigger').first().json.message.chat.id }}`
   - Text: 
   ```
   🏋️ **Your Workout Analysis**

   {{ $('AI Agent').first().json.output }}

   📊 **Progress Charts**
   {{ $('Code').first().json.charts }}
   ```

### 3. AI System Message

Copy this into your AI Agent's system message:

```
You are an expert fitness coach and nutritionist specializing in body transformation and strength training. You are helping a client who is:

PHYSICAL STATS:
- Height: 180cm
- Weight: 83kg
- Goal: Fat loss while maintaining/building muscle

STRENGTH PROFILE:
- STRONG areas: Back, legs, glutes
- WEAK areas: Chest, arms, abs

YOUR ROLE:
Analyze the provided workout data and give personalized recommendations focusing on:

1. WORKOUT OPTIMIZATION:
   - Prioritize chest, arms, and abs development
   - Maintain current back/leg/glute strength
   - Suggest exercise modifications and progressions
   - Recommend training frequency and volume adjustments
   - Identify muscle imbalances and corrective strategies

2. NUTRITION GUIDANCE:
   - Fat loss nutrition strategies
   - Macro recommendations for body recomposition
   - Meal timing suggestions
   - Supplement recommendations if needed

3. BODY RECOMPOSITION:
   - Strategies to lose fat while preserving/building muscle
   - Training periodization for optimal results
   - Recovery and sleep optimization

COMMUNICATION STYLE:
- Be specific and actionable
- Use data from the workout analysis
- Provide concrete numbers (sets, reps, weights)
- Include progression timelines
- Be motivational but realistic
- Focus on sustainable long-term changes
- IMPORTANT: Always respond in plain text format. Do NOT use markdown formatting like *, **, ###, or \n. Use actual line breaks and simple text formatting only.

Always base your recommendations on the actual workout data provided and tailor advice to address the specific strength imbalances and fat loss goals.
```

**📝 Note**: Update the physical stats and goals to match your own!

## How to Use

### 1. Export Data from Hevy
1. Open **Hevy app** on your phone
2. Go to **Profile** → **Export Data**
3. Choose **CSV format**
4. **Download** the file

### 2. Send to Your Bot
1. Open **Telegram**
2. Find your bot
3. **Send the CSV file** as an attachment
4. **Wait 10-30 seconds** for analysis

### 3. Get Your Coaching!
You'll receive:
- 🎯 Personalized workout recommendations
- 📈 Progress analysis for your top exercises
- 💪 Specific advice for weak areas
- 🍽️ Nutrition suggestions
- 📊 ASCII progress charts

## 🛠️ Troubleshooting

### "No workout data found"
- ✅ Make sure you're sending a CSV file (not screenshot)
- ✅ Check that the CSV has data in it
- ✅ Verify the Extract from File node is connected

### "AI not responding"
- ✅ Check your AI service API key
- ✅ Make sure you have credits/quota available
- ✅ Verify the AI prompt field: `{{ $('Code').first().json.aiPrompt }}`

### "Charts not showing"
- ✅ Make sure you have at least 2 workouts for the same exercise
- ✅ Check the Telegram message includes: `{{ $('Code').first().json.charts }}`

### "Workflow not triggering"
- ✅ Make sure your Telegram bot token is correct
- ✅ Try sending `/start` to your bot first
- ✅ Check that "Download attachments" is enabled

## 🎨 Customization

### Change Your Stats
Edit the AI system message to match your:
- Height and weight
- Fitness goals
- Strong/weak muscle groups

### Add More Exercises to Charts
In the code, change this line:
```javascript
.slice(0, 3);  // Change 3 to show more exercises
```

### Modify Chart Style
Look for the `createProgressChart` function in the code and customize:
- Bar characters (█ ░)
- Chart width
- Date format

## 🔧 Advanced Features

### Save Data Locally
Add a "Write Binary File" node after "Extract from File":
- **File Path**: `/path/to/save/workout_data.csv`
- **Property Name**: `data`

### Multiple AI Services
Create parallel AI Agent nodes for:
- Workout analysis (OpenAI GPT-4)
- Nutrition advice (Claude)
- Form checking (DeepSeek)

### Scheduled Analysis
Replace Telegram Trigger with:
- **Schedule Trigger** (daily/weekly analysis)
- **Google Drive Trigger** (auto-process new uploads)

## 📁 Project Structure

```
Hevy-Coach/
├── README.md              # This guide
├── docker-compose.yml     # Docker setup (optional)
├── Dockerfile             # Custom n8n image (optional)
├── n8n_code_node.js       # Main processing code
└── workout_data.csv       # Sample data
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**🎉 Ready to transform your workouts? Start building your AI coach today!**

*Made with ❤️ for the fitness community* 
