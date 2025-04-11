"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sun,
  Moon,
  CloudSun,
  Brain,
  Heart,
  Coffee,
  Book,
  Music,
  Users,
  Activity,
  Medal,
  LineChart,
  Zap,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Clock,
  Award,
  PieChart,
  Download
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  activities: string[];
  triggers: string[];
  notes: string;
}

interface InsightMetrics {
  averageMood: number;
  moodTrend: 'up' | 'down' | 'stable';
  sleepQuality: number;
  energyLevel: number;
  topTriggers: string[];
  helpfulActivities: string[];
}

const MentalWellness: React.FC = () => {
  const [activeView, setActiveView] = useState<'journal' | 'insights' | 'trends'>('insights');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState<'mood' | 'anxiety' | 'sleep' | 'energy' | 'focus'>('mood');
  const [insightMode, setInsightMode] = useState<'patterns' | 'triggers' | 'risks' | 'growth'>('patterns');
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [insights, setInsights] = useState<InsightMetrics>({
    averageMood: 3.8,
    moodTrend: 'up',
    sleepQuality: 4.2,
    energyLevel: 3.5,
    topTriggers: ['Work Stress', 'Poor Sleep', 'Social Media'],
    helpfulActivities: ['Exercise', 'Meditation', 'Reading']
  });

  useEffect(() => {
    // Generate mock data on mount
    const data = generateMockData();
    setMoodData(data);
    setInsights(generateInsights(data));
  }, []);

  const generateMockData = (): MoodEntry[] => {
    // Create 30 days of mock data
    const data: MoodEntry[] = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate some patterns - better mood on weekends, etc.
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseMood = isWeekend ? 4.2 : 3.7;
      const dayVariation = Math.random() * 1.5 - 0.75; // -0.75 to +0.75
      
      data.push({
        date: date.toISOString(),
        mood: Math.max(1, Math.min(5, baseMood + dayVariation)),
        energy: Math.max(1, Math.min(5, (baseMood - 0.5) + dayVariation)),
        sleep: Math.max(1, Math.min(5, 3.5 + Math.random() * 1.5 - 0.75)),
        activities: ['Exercise', 'Reading', 'Meditation', 'Social', 'Work', 'Entertainment']
          .filter(() => Math.random() > 0.6),
        triggers: ['Work Stress', 'Conflict', 'Poor Sleep', 'Social Media', 'News', 'Financial Concerns']
          .filter(() => Math.random() > 0.8),
        notes: ''
      });
    }
    
    return data;
  };

  const generateInsights = (data: MoodEntry[]): InsightMetrics => {
    // Calculate insights based on the data
    const moodSum = data.reduce((sum, entry) => sum + entry.mood, 0);
    const averageMood = Math.round((moodSum / data.length) * 10) / 10;
    
    // Calculate trend (last week vs previous week)
    const recentMood = data.slice(0, 7).reduce((sum, entry) => sum + entry.mood, 0) / 7;
    const olderMood = data.slice(7, 14).reduce((sum, entry) => sum + entry.mood, 0) / 7;
    const moodTrend = recentMood > olderMood + 0.2 ? 'up' : 
                      recentMood < olderMood - 0.2 ? 'down' : 'stable';
    
    // Calculate sleep quality
    const sleepSum = data.reduce((sum, entry) => sum + entry.sleep, 0);
    const sleepQuality = Math.round((sleepSum / data.length) * 10) / 10;
    
    // Calculate energy level
    const energySum = data.reduce((sum, entry) => sum + entry.energy, 0);
    const energyLevel = Math.round((energySum / data.length) * 10) / 10;
    
    // Find top triggers and activities
    const triggerCounts: Record<string, number> = {};
    const activityCounts: Record<string, number> = {};
    
    data.forEach(entry => {
      entry.triggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
      
      entry.activities.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });
    
    // Sort by count and get top 3
    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);
    
    const helpfulActivities = Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([activity]) => activity);
    
    return {
      averageMood,
      moodTrend,
      sleepQuality,
      energyLevel,
      topTriggers,
      helpfulActivities
    };
  };

  const moodTags = [
    { name: 'Happy', color: 'rgb(77, 148, 255)' }, 
    { name: 'Joyful', color: 'rgb(100, 125, 230)' },
    { name: 'Calm', color: 'rgb(77, 160, 255)' }, 
    { name: 'Relaxed', color: 'rgb(77, 184, 255)' },
    { name: 'Peaceful', color: 'rgb(77, 200, 255)' }, 
    { name: 'Content', color: 'rgb(0, 200, 83)' },
    { name: 'Hopeful', color: 'rgb(0, 200, 120)' }, 
    { name: 'Grateful', color: 'rgb(0, 200, 160)' },
    { name: 'Inspired', color: 'rgb(138, 43, 226)' },
    { name: 'Energetic', color: 'rgb(255, 160, 10)' }, 
    { name: 'Motivated', color: 'rgb(255, 140, 20)' },
    { name: 'Excited', color: 'rgb(255, 120, 30)' },
    { name: 'Anxious', color: 'rgb(255, 80, 80)' }, 
    { name: 'Nervous', color: 'rgb(255, 100, 100)' },
    { name: 'Stressed', color: 'rgb(255, 120, 120)' }, 
    { name: 'Overwhelmed', color: 'rgb(255, 140, 140)' },
    { name: 'Frustrated', color: 'rgb(250, 100, 30)' }, 
    { name: 'Sad', color: 'rgb(100, 140, 255)' },
    { name: 'Gloomy', color: 'rgb(80, 120, 220)' }, 
    { name: 'Tired', color: 'rgb(100, 100, 120)' },
    { name: 'Exhausted', color: 'rgb(80, 80, 100)' }, 
    { name: 'Confused', color: 'rgb(150, 150, 170)' },
    { name: 'Uncertain', color: 'rgb(120, 120, 150)' }
  ];
  
  const toggleMoodTag = (tagName: string) => {
    // Implementation of toggleMoodTag function
  };

  const renderJournalView = () => (
    <div className="journal-container">
      <div className="journal-header">
        <h1>Mood Journal</h1>
        <p>Express your thoughts and feelings to track your emotional wellbeing</p>
        <div className="date-display">Thursday, March 6, 2025</div>
      </div>
      
      <div className="time-selector">
        <button 
          className={`time-btn ${timeOfDay === 'morning' ? 'active' : ''}`}
          onClick={() => setTimeOfDay('morning')}
        >
          <Sun size={18} />
          <span>Morning</span>
        </button>
        <button 
          className={`time-btn ${timeOfDay === 'afternoon' ? 'active' : ''}`}
          onClick={() => setTimeOfDay('afternoon')}
        >
          <CloudSun size={18} />
          <span>Afternoon</span>
        </button>
        <button 
          className={`time-btn ${timeOfDay === 'night' ? 'active' : ''}`}
          onClick={() => setTimeOfDay('night')}
        >
          <Moon size={18} />
          <span>Night</span>
        </button>
        <div className="mood-indicator">😊</div>
      </div>
      
      <div className="journal-entry">
        <textarea 
          placeholder="Write about your thoughts, feelings, and experiences..."
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          rows={10}
        />
        <div className="char-count">
          {journalEntry.length} chars
        </div>
      </div>
      
      <div className="tags-section">
        <h2>Mood Tags</h2>
        <div className="mood-tags-grid">
          {moodTags.map(tag => (
            <button 
              key={tag.name}
              onClick={() => toggleMoodTag(tag.name)}
              className={`mood-tag ${selectedMoodTags.includes(tag.name) ? 'selected' : ''}`}
              style={{ 
                backgroundColor: selectedMoodTags.includes(tag.name) 
                  ? tag.color 
                  : 'rgba(20, 30, 20, 0.3)',
                borderColor: tag.color
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="journal-actions">
        <button className="save-draft-btn">
          Save Draft
        </button>
        <button className="save-entry-btn">
          Save Entry
        </button>
      </div>
    </div>
  );

  const renderInsightsView = () => (
    <div className="insights-dashboard">
      <div className="insights-header">
        <div className="header-title">
          <Brain className="header-icon" />
          <div>
            <h1>This Week's Wellness Insights</h1>
            <p>Your mental health at a glance</p>
          </div>
        </div>
        
        <div className="time-range-tabs">
          <button 
            className={`range-tab ${timeRange === 'day' ? 'active' : ''}`}
            onClick={() => setTimeRange('day')}
          >
            Day
          </button>
          <button 
            className={`range-tab ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`range-tab ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button className="export-btn">
            Export Week
          </button>
          <button className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="overview-card">
          <h2>Overall Wellness</h2>
          <div className="wellness-score">
            <div className="score-circle">
              <svg viewBox="0 0 100 100" width="160" height="160">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(77, 148, 255, 0.2)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="transparent" 
                  stroke="rgb(77, 148, 255)" 
                  strokeWidth="8" 
                  strokeDasharray="282.7"
                  strokeDashoffset={282.7 - (282.7 * 0.71)}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-text">71%</div>
              <div className="score-label">Wellness Score</div>
            </div>
            
            <div className="metrics-list">
              <div className="metric-item">
                <Sun size={18} className="metric-icon metric-mood" />
                <span className="metric-name">Mood</span>
                <span className="metric-value">70%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '70%', background: 'rgb(77, 148, 255)' }}></div>
                </div>
              </div>
              
              <div className="metric-item">
                <Activity size={18} className="metric-icon metric-anxiety" />
                <span className="metric-name">Anxiety</span>
                <span className="metric-value">70%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '70%', background: 'rgb(255, 122, 0)' }}></div>
                </div>
              </div>
              
              <div className="metric-item">
                <Moon size={18} className="metric-icon metric-sleep" />
                <span className="metric-name">Sleep</span>
                <span className="metric-value">80%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '80%', background: 'rgb(138, 43, 226)' }}></div>
                </div>
              </div>
              
              <div className="metric-item">
                <Zap size={18} className="metric-icon metric-energy" />
                <span className="metric-name">Energy</span>
                <span className="metric-value">60%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '60%', background: 'rgb(255, 193, 7)' }}></div>
                </div>
              </div>
              
              <div className="metric-item">
                <Brain size={18} className="metric-icon metric-focus" />
                <span className="metric-name">Focus</span>
                <span className="metric-value">70%</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{ width: '70%', background: 'rgb(0, 200, 83)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="insights-card">
          <div className="card-header">
            <h2>Daily Patterns & Insights</h2>
            <p>Understanding your daily wellness rhythms</p>
          </div>
          
          <h3>Time-based Patterns</h3>
          
          <div className="patterns-grid">
            <div className="pattern-box">
              <Sun className="pattern-icon" />
              <h4>Best Time</h4>
              <div className="pattern-value">Morning</div>
              <div className="pattern-desc">Highest energy & mood</div>
            </div>
            
            <div className="pattern-box">
              <Clock className="pattern-icon" />
              <h4>Rest Period</h4>
              <div className="pattern-value">3 PM - 4 PM</div>
              <div className="pattern-desc">Recommended break time</div>
            </div>
            
            <div className="pattern-box">
              <Brain className="pattern-icon" />
              <h4>Meditation</h4>
              <div className="pattern-value">120min</div>
              <div className="pattern-desc">Total mindful minutes</div>
            </div>
            
            <div className="pattern-box">
              <TrendingUp className="pattern-icon" />
              <h4>Improvement</h4>
              <div className="pattern-value">+15%</div>
              <div className="pattern-desc">Mood trend this week</div>
            </div>
          </div>
          
          <div className="achievements-section">
            <div className="section-header">
              <h3>Recent Achievements</h3>
              <button className="more-btn">Show More</button>
            </div>
            
            <div className="achievements-grid">
              <div className="achievement-box">
                <Medal className="achievement-icon" />
                <div>
                  <h4>Consistency King</h4>
                  <p>Logged mood for 7 days straight</p>
                </div>
              </div>
              
              <div className="achievement-box">
                <Brain className="achievement-icon" />
                <div>
                  <h4>Meditation Master</h4>
                  <p>Completed 10 meditation sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendsView = () => (
    <div className="trends-container">
      <div className="trends-section">
        <div className="section-header">
          <div>
            <h2>Wellness Trends</h2>
            <p>Track your wellness metrics over time</p>
          </div>
          <div className="time-selector">
            <select defaultValue="30">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>
        
        <div className="tabs-row">
          <button className="tab-btn active">Mood</button>
          <button className="tab-btn">Anxiety</button>
          <button className="tab-btn">Sleep</button>
          <button className="tab-btn">Energy</button>
          <button className="tab-btn">Focus</button>
        </div>
        
        <div className="chart-container">
          <div className="line-chart">
            {/* Placeholder for chart - in a real app we'd use a chart library */}
            <div className="chart-placeholder" style={{ height: '300px', background: 'linear-gradient(180deg, rgba(77, 148, 255, 0.2) 0%, rgba(77, 148, 255, 0) 100%)' }}>
              <svg viewBox="0 0 500 300" width="100%" height="100%">
                <path d="M0,240 C50,180 100,220 150,200 C200,180 250,120 300,150 C350,180 400,100 450,120 C480,130 500,150 500,150" 
                  fill="none" 
                  stroke="rgb(77, 148, 255)" 
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="trend-info">
          <h3>About Mood Rating</h3>
          <p>Your mood patterns show natural fluctuations throughout the week with peaks on weekends. Try to identify activities that positively impact your mood.</p>
        </div>
      </div>
      
      <div className="patterns-section">
        <div className="section-header">
          <div>
            <h2>Mood Patterns</h2>
            <p>Discover patterns in your mood data</p>
          </div>
        </div>
        
        <div className="tabs-row">
          <button className="tab-btn active">Distribution</button>
          <button className="tab-btn">Time of Day</button>
          <button className="tab-btn">Day of Week</button>
          <button className="tab-btn">Factors</button>
        </div>
        
        <div className="chart-grid">
          <div className="donut-chart">
            {/* Placeholder for donut chart */}
            <div className="chart-placeholder" style={{ height: '280px' }}>
              <svg viewBox="0 0 200 200" width="200" height="200">
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="rgba(77, 148, 255, 0.5)" strokeWidth="30" strokeDasharray="502.4" strokeDashoffset="411.968" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="rgba(138, 43, 226, 0.5)" strokeWidth="30" strokeDasharray="502.4" strokeDashoffset="477.28" strokeDashoffset="411.968" transform="rotate(10 100 100)" />
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="rgba(255, 122, 0, 0.5)" strokeWidth="30" strokeDasharray="502.4" strokeDashoffset="477.28" transform="rotate(85 100 100)" />
              </svg>
              <div className="chart-center-text">
                <div className="value-text">18 days</div>
                <div className="label-text">(18%)</div>
              </div>
            </div>
            <div className="chart-legend">Excellent</div>
          </div>
          
          <div className="pattern-insight">
            <div className="insight-header">
              <Brain size={20} />
              <h3>Pattern Insights</h3>
              <ArrowRight size={16} className="arrow-icon" />
            </div>
            <p>Your mood distribution shows that you generally maintain a positive outlook, with 63% of your recordings in the "Good" or "Excellent" range.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIInsights = () => (
    <div className="ai-insights-container">
      <div className="ai-header">
        <div className="header-title">
          <Brain size={22} className="header-icon" />
          <h2>AI Wellness Insights</h2>
        </div>
        <p>Personalized analysis of your mental wellbeing data</p>
        <button className="refresh-btn">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      
      <div className="insights-tabs">
        <button className={`insight-tab ${insightMode === 'patterns' ? 'active' : ''}`} onClick={() => setInsightMode('patterns')}>
          <LineChart size={18} />
          Mood Patterns
        </button>
        <button className={`insight-tab ${insightMode === 'triggers' ? 'active' : ''}`} onClick={() => setInsightMode('triggers')}>
          <Activity size={18} />
          Mood Triggers
        </button>
        <button className={`insight-tab ${insightMode === 'risks' ? 'active' : ''}`} onClick={() => setInsightMode('risks')}>
          <Activity size={18} />
          Potential Risks
        </button>
        <button className={`insight-tab ${insightMode === 'growth' ? 'active' : ''}`} onClick={() => setInsightMode('growth')}>
          <Sparkles size={18} />
          Growth Opportunities
        </button>
      </div>
      
      <div className="insights-cards">
        <div className="insight-card">
          <div className="insight-icon">
            <Sun size={20} />
          </div>
          <div className="insight-content">
            <div className="insight-header">
              <h3>Weekend Elevation</h3>
              <span className="insight-badge">Insight</span>
              <ArrowRight size={16} className="arrow-icon" />
            </div>
            <p>Your mood consistently improves by 28% on weekends compared to weekdays. This suggests work-related stress might be affecting your wellbeing.</p>
            
            <div className="impact-level">
              <span>Impact Level</span>
              <div className="impact-bar">
                <div className="impact-fill" style={{ width: '70%' }}></div>
              </div>
              <span className="impact-value">70%</span>
            </div>
          </div>
        </div>
        
        <div className="insight-card">
          <div className="insight-icon">
            <Coffee size={20} />
          </div>
          <div className="insight-content">
            <div className="insight-header">
              <h3>Morning Brightness</h3>
              <span className="insight-badge">Insight</span>
              <ArrowRight size={16} className="arrow-icon" />
            </div>
            <p>Morning recordings show 32% higher mood scores than evening ones, indicating potential energy depletion throughout the day.</p>
            
            <div className="impact-level">
              <span>Impact Level</span>
              <div className="impact-bar">
                <div className="impact-fill" style={{ width: '65%' }}></div>
              </div>
              <span className="impact-value">65%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MoodMetrics = () => {
    return (
      <div className="mood-metrics-container">
        <div className="mood-metric">
          <div className="metric-header">
            <Sun size={20} className="metric-icon" />
            <span className="metric-name">Mood</span>
            <div className="status-tag good">Good</div>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              className="metric-slider mood-slider" 
              min="0" 
              max="100" 
              defaultValue="80"
              readOnly
            />
            <div className="slider-track mood-track"></div>
            <div className="slider-thumb" style={{ left: '80%' }}></div>
          </div>
          <div className="metric-scale">
            <span className="metric-mood">Very Low</span>
            <span className="metric-mood">Neutral</span>
            <span className="metric-mood">Excellent</span>
          </div>
        </div>

        <div className="mood-metric">
          <div className="metric-header">
            <Activity size={20} className="metric-icon" />
            <span className="metric-name">Anxiety Level</span>
            <div className="status-tag mild">Mild</div>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              className="metric-slider anxiety-slider" 
              min="0" 
              max="100" 
              defaultValue="35"
              readOnly
            />
            <div className="slider-track anxiety-track"></div>
            <div className="slider-thumb" style={{ left: '35%' }}></div>
          </div>
          <div className="metric-scale">
            <span className="metric-anxiety">Calm</span>
            <span className="metric-anxiety">Moderate</span>
            <span className="metric-anxiety">High</span>
          </div>
        </div>

        <div className="mood-metric">
          <div className="metric-header">
            <Moon size={20} className="metric-icon" />
            <span className="metric-name">Sleep Quality</span>
            <div className="status-tag na">N/A</div>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              className="metric-slider sleep-slider" 
              min="0" 
              max="100" 
              defaultValue="90"
              readOnly
            />
            <div className="slider-track sleep-track"></div>
            <div className="slider-thumb" style={{ left: '90%' }}></div>
          </div>
          <div className="metric-scale">
            <span className="metric-sleep">Poor</span>
            <span className="metric-sleep">Fair</span>
            <span className="metric-sleep">Excellent</span>
          </div>
        </div>

        <div className="mood-metric">
          <div className="metric-header">
            <Zap size={20} className="metric-icon" />
            <span className="metric-name">Energy Level</span>
            <div className="status-tag neutral">Moderate</div>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              className="metric-slider energy-slider" 
              min="0" 
              max="100" 
              defaultValue="65"
              readOnly
            />
            <div className="slider-track energy-track"></div>
            <div className="slider-thumb" style={{ left: '65%' }}></div>
          </div>
          <div className="metric-scale">
            <span className="metric-energy">Exhausted</span>
            <span className="metric-energy">Moderate</span>
            <span className="metric-energy">Energetic</span>
          </div>
        </div>

        <div className="mood-metric">
          <div className="metric-header">
            <Brain size={20} className="metric-icon" />
            <span className="metric-name">Focus Level</span>
            <div className="status-tag good">Focused</div>
          </div>
          <div className="slider-container">
            <input 
              type="range" 
              className="metric-slider focus-slider" 
              min="0" 
              max="100" 
              defaultValue="80"
              readOnly
            />
            <div className="slider-track focus-track"></div>
            <div className="slider-thumb" style={{ left: '80%' }}></div>
          </div>
          <div className="metric-scale">
            <span className="metric-focus">Distracted</span>
            <span className="metric-focus">Moderate</span>
            <span className="metric-focus">Highly Focused</span>
          </div>
        </div>

        <div className="wellness-score">
          <h3>Overall Wellness Score</h3>
          <div className="score-display">
            <div className="score-value">71%</div>
          </div>
          <div className="score-bar">
            <div className="score-fill" style={{ width: '71%' }}></div>
          </div>
          <p className="score-description">Good - You're doing well</p>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="wellness-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <Brain size={24} className="header-icon" />
            <div>
              <h1>This Week's Wellness Insights</h1>
              <p>Your mental health at a glance</p>
            </div>
          </div>
          
          <div className="time-controls">
            <div className="time-tabs">
              <button 
                className={`time-tab ${timeRange === 'day' ? 'active' : ''}`}
                onClick={() => setTimeRange('day')}
              >
                Day
              </button>
              <button 
                className={`time-tab ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`time-tab ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
            </div>
            
            <button className="export-btn">
              <Download size={16} />
              Export Week
            </button>
            
            <button className="refresh-btn">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
        
        <div className="dashboard-grid">
          <div className="score-card">
            <h2>Overall Wellness</h2>
            <div className="score-circle">
              <svg viewBox="0 0 100 100" width="160" height="160">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(77, 148, 255, 0.2)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="rgb(77, 148, 255)" 
                  strokeWidth="8" 
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * 0.71)}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="score-content">
                <div className="score-text">71%</div>
                <div className="score-label">Wellness Score</div>
              </div>
            </div>
            
            <div className="metrics-overview">
              <div className="metric-item">
                <Sun size={18} className="metric-icon metric-mood" />
                <span className="metric-name">Mood</span>
                <div className="metric-bar">
                  <div className="metric-fill mood-fill" style={{ width: '70%' }}></div>
                </div>
                <span className="metric-value">70%</span>
              </div>
              
              <div className="metric-item">
                <Activity size={18} className="metric-icon metric-anxiety" />
                <span className="metric-name">Anxiety</span>
                <div className="metric-bar">
                  <div className="metric-fill anxiety-fill" style={{ width: '70%' }}></div>
                </div>
                <span className="metric-value">70%</span>
              </div>
              
              <div className="metric-item">
                <Moon size={18} className="metric-icon metric-sleep" />
                <span className="metric-name">Sleep</span>
                <div className="metric-bar">
                  <div className="metric-fill sleep-fill" style={{ width: '80%' }}></div>
                </div>
                <span className="metric-value">80%</span>
              </div>
              
              <div className="metric-item">
                <Zap size={18} className="metric-icon metric-energy" />
                <span className="metric-name">Energy</span>
                <div className="metric-bar">
                  <div className="metric-fill energy-fill" style={{ width: '60%' }}></div>
                </div>
                <span className="metric-value">60%</span>
              </div>
              
              <div className="metric-item">
                <Brain size={18} className="metric-icon metric-focus" />
                <span className="metric-name">Focus</span>
                <div className="metric-bar">
                  <div className="metric-fill focus-fill" style={{ width: '70%' }}></div>
                </div>
                <span className="metric-value">70%</span>
              </div>
            </div>
          </div>
          
          <div className="insights-card">
            <div className="card-header">
              <h2>Daily Patterns & Insights</h2>
              <p>Understanding your daily wellness rhythms</p>
            </div>
            
            <h3>Time-based Patterns</h3>
            
            <div className="patterns-grid">
              <div className="pattern-box">
                <Sun size={24} className="pattern-icon" />
                <h4>Best Time</h4>
                <div className="pattern-value">Morning</div>
                <div className="pattern-desc">Highest energy & mood</div>
              </div>
              
              <div className="pattern-box">
                <Clock size={24} className="pattern-icon" />
                <h4>Rest Period</h4>
                <div className="pattern-value">3 PM - 4 PM</div>
                <div className="pattern-desc">Recommended break time</div>
              </div>
              
              <div className="pattern-box">
                <Brain size={24} className="pattern-icon" />
                <h4>Meditation</h4>
                <div className="pattern-value">120min</div>
                <div className="pattern-desc">Total mindful minutes</div>
              </div>
              
              <div className="pattern-box">
                <TrendingUp size={24} className="pattern-icon" />
                <h4>Improvement</h4>
                <div className="pattern-value">+15%</div>
                <div className="pattern-desc">Mood trend this week</div>
              </div>
            </div>
            
            <div className="achievements">
              <div className="section-header">
                <h3>Recent Achievements</h3>
                <button className="more-btn">Show More</button>
              </div>
              
              <div className="achievements-grid">
                <div className="achievement-item">
                  <Medal className="achievement-icon" />
                  <div className="achievement-content">
                    <h4>Consistency King</h4>
                    <p>Logged mood for 7 days straight</p>
                  </div>
                </div>
                
                <div className="achievement-item">
                  <Brain className="achievement-icon" />
                  <div className="achievement-content">
                    <h4>Meditation Master</h4>
                    <p>Completed 10 meditation sessions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mental-wellness">
      <div className="view-tabs">
        <button 
          className={`view-tab ${activeView === 'journal' ? 'active' : ''}`}
          onClick={() => setActiveView('journal')}
        >
          <Heart size={16} />
          Mood Journal
        </button>
        <button 
          className={`view-tab ${activeView === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveView('insights')}
        >
          <BarChart size={16} />
          Wellness Insights
        </button>
        <button 
          className={`view-tab ${activeView === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveView('trends')}
        >
          <LineChart size={16} />
          Wellness Trends
        </button>
      </div>
      
      {activeView === 'journal' && renderJournalView()}
      {activeView === 'insights' && renderInsightsView()}
      {activeView === 'trends' && (
        <>
          {renderTrendsView()}
          {renderAIInsights()}
        </>
      )}
      
      {renderMoodCheckInSliders()}
      <MoodMetrics />
      {renderDashboard()}
    </div>
  );
};

export default MentalWellness; 