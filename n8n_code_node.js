// n8n Code Node - Workout Data Processor (JavaScript)
// This script processes workout JSON data and generates charts + raw data for AI analysis

// Get input data from previous node
const inputData = $input.all();

// Extract the workout data array from the input
let workoutData = [];
if (inputData && inputData.length > 0) {
    // Extract the actual data from n8n's wrapper structure
    workoutData = inputData.map(item => {
        // If data is wrapped in json field, extract it
        if (item.json) {
            return item.json;
        }
        return item;
    });
}

if (workoutData.length === 0) {
    return [{
        json: {
            error: "No workout data found",
            rawData: [],
            charts: "",
            dataCount: 0
        }
    }];
}

// Function to parse date string to Date object
function parseDate(dateStr) {
    try {
        const parts = dateStr.split(', ');
        const datePart = parts[0]; // "30 Jun 2025"
        const timePart = parts[1]; // "19:56"
        
        const dateObj = new Date(datePart + ' ' + timePart);
        return dateObj;
    } catch (e) {
        return new Date();
    }
}

// Function to calculate volume (weight × reps)
function calculateVolume(weight, reps) {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    return w * r;
}

// Minimal processing: Add calculated fields, remove useless columns, and sort by date
const processedData = workoutData.map(set => {
    // Remove title and description columns, keep only useful data
    const {title, description, ...cleanSet} = set;
    
    const weight = parseFloat(set.weight_kg) || 0;
    const reps = parseInt(set.reps) || 0;
    
    return {
        start_time: set.start_time,
        end_time: set.end_time,
        exercise_title: set.exercise_title,
        set_index: parseInt(set.set_index) || 0,
        set_type: set.set_type,
        weight_kg: weight,
        reps: reps,
        volume: calculateVolume(weight, reps),
        date: parseDate(set.start_time),
        // Include other useful fields if they exist
        ...(set.superset_id && { superset_id: set.superset_id }),
        ...(set.exercise_notes && { exercise_notes: set.exercise_notes }),
        ...(set.distance_km && { distance_km: set.distance_km }),
        ...(set.duration_seconds && { duration_seconds: set.duration_seconds }),
        ...(set.rpe && { rpe: set.rpe })
    };
}).sort((a, b) => b.date - a.date); // Most recent first

// Generate charts for visualization (only for plotting purposes)
// Group by exercise for chart generation
const exerciseData = {};
processedData.forEach(set => {
    const exercise = set.exercise_title;
    if (!exerciseData[exercise]) {
        exerciseData[exercise] = [];
    }
    exerciseData[exercise].push({
        date: set.date,
        weight: set.weight_kg,
        reps: set.reps,
        volume: set.volume,
        workout_session: set.start_time // Use start_time instead of title
    });
});

// Create simple progress charts for top 3 exercises (by frequency)
const topExercises = Object.entries(exerciseData)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

// Function to create ASCII progress chart
function createProgressChart(exerciseName, exerciseHistory) {
    if (exerciseHistory.length < 2) return `${exerciseName}: Not enough data for chart`;
    
    // Group by workout session to get max weight per session
    const sessionData = {};
    exerciseHistory.forEach(set => {
        const sessionKey = set.workout_session + '_' + set.date.toDateString();
        if (!sessionData[sessionKey] || sessionData[sessionKey].weight < set.weight) {
            sessionData[sessionKey] = {
                date: set.date,
                weight: set.weight,
                volume: set.volume
            };
        }
    });
    
    const sessions = Object.values(sessionData).sort((a, b) => a.date - b.date);
    
    if (sessions.length < 2) return `${exerciseName}: Not enough sessions for chart`;
    
    const maxWeight = Math.max(...sessions.map(s => s.weight));
    const minWeight = Math.min(...sessions.map(s => s.weight));
    const range = maxWeight - minWeight;
    
    if (range === 0) return `${exerciseName}: Consistent weight at ${maxWeight}kg`;
    
    let chart = `📈 ${exerciseName} Progress:\n`;
    chart += "─".repeat(35) + "\n";
    
    sessions.slice(-6).forEach(session => {
        const normalizedWeight = range > 0 ? (session.weight - minWeight) / range : 0;
        const barLength = Math.round(normalizedWeight * 15);
        const bar = "█".repeat(barLength) + "░".repeat(15 - barLength);
        const dateStr = session.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        chart += `${dateStr} |${bar}| ${session.weight}kg\n`;
    });
    
    return chart;
}

// Generate charts
let charts = "📊 WORKOUT PROGRESS CHARTS\n";
charts += "═".repeat(30) + "\n\n";

topExercises.forEach(([exercise, history]) => {
    charts += createProgressChart(exercise, history) + "\n\n";
});

// Basic statistics for context (minimal processing)
const totalSets = processedData.length;
const uniqueExercises = new Set(processedData.map(set => set.exercise_title)).size;
const totalVolume = processedData.reduce((sum, set) => sum + set.volume, 0);
const dateRange = {
    earliest: processedData[processedData.length - 1]?.start_time,
    latest: processedData[0]?.start_time
};

// Create AI prompt with clean raw data
const aiPrompt = `You are an expert fitness coach and nutritionist specializing in body transformation and strength training. You are helping a client who is:

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

Always base your recommendations on the actual workout data provided and tailor advice to address the specific strength imbalances and fat loss goals.

RAW WORKOUT DATA:
${JSON.stringify(processedData, null, 2)}

BASIC STATS:
- Total sets recorded: ${totalSets}
- Unique exercises: ${uniqueExercises}
- Total volume lifted: ${totalVolume.toLocaleString()}kg
- Date range: ${dateRange.earliest} to ${dateRange.latest}

Please provide:
1. 🎯 Analysis of my training patterns and progression
2. 💪 Specific recommendations for each major exercise
3. 📈 Insights about my performance trends
4. 🏆 Areas where I'm progressing well
5. ⚠️ Areas that need attention or improvement
6. 🔄 Suggestions for optimizing my routine
7. 📋 Concrete next steps for continued progress

Focus on actionable, specific advice based on the actual data patterns you observe.`;

// Return the processed data
return [{
    json: {
        // Clean raw data for AI analysis (without n8n wrapper fields)
        rawData: processedData,
        
        // AI prompt with clean raw data
        aiPrompt: aiPrompt,
        
        // Charts for visualization
        charts: charts,
        
        // Basic metadata
        metadata: {
            totalSets: totalSets,
            uniqueExercises: uniqueExercises,
            totalVolume: totalVolume,
            dateRange: dateRange,
            topExercises: topExercises.map(([name, data]) => ({
                name: name,
                frequency: data.length
            }))
        }
    }
}]; 