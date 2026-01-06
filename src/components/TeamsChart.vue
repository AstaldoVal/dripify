<template>
  <div class="teams-chart">
    <div class="teams-header">
      <h2 class="teams-title">Teams</h2>
      <div class="teams-controls">
        <div class="date-range-selector">
          <button
            v-for="range in dateRanges"
            :key="range.id"
            class="date-range-btn"
            :class="{ active: selectedRange === range.id }"
            @click="selectedRange = range.id"
          >
            {{ range.label }}
          </button>
        </div>
        <button class="view-team-btn">View team</button>
      </div>
    </div>

    <div class="teams-content">
      <!-- Teams List -->
      <div class="teams-list">
        <div class="team-group">
          <div class="team-header">
            <span class="team-name">Marketing Team</span>
            <span class="team-members-count">4 members</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="team-icon">
              <path d="M2 12V10C2 8.89543 2.89543 8 4 8H6M10 8H12C13.1046 8 14 8.89543 14 10V12M10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6ZM4 6C4 7.10457 4.89543 8 6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6Z" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="team-members">
            <div class="team-member">
              <div class="member-avatar">
                <img src="https://i.pravatar.cc/40?img=12" alt="Dominic Baker" />
              </div>
              <div class="member-info">
                <span class="member-name">Dominic Baker</span>
                <span class="member-role">Owner</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="member-chart-icon">
                <path d="M2 12V10C2 8.89543 2.89543 8 4 8H6M10 8H12C13.1046 8 14 8.89543 14 10V12M10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6ZM4 6C4 7.10457 4.89543 8 6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6Z" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="team-member">
              <div class="member-avatar">
                <img src="https://i.pravatar.cc/40?img=33" alt="Ollie Baldwin" />
              </div>
              <div class="member-info">
                <span class="member-name">Ollie Baldwin</span>
                <span class="member-role">User</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="member-chart-icon">
                <path d="M2 12V10C2 8.89543 2.89543 8 4 8H6M10 8H12C13.1046 8 14 8.89543 14 10V12M10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6ZM4 6C4 7.10457 4.89543 8 6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6Z" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="team-member">
              <div class="member-avatar">
                <img src="https://i.pravatar.cc/40?img=47" alt="Linh Nguyen" />
              </div>
              <div class="member-info">
                <span class="member-name">Linh Nguyen</span>
                <span class="member-role">User</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="member-chart-icon">
                <path d="M2 12V10C2 8.89543 2.89543 8 4 8H6M10 8H12C13.1046 8 14 8.89543 14 10V12M10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6ZM4 6C4 7.10457 4.89543 8 6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6Z" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="team-member">
              <div class="member-avatar">
                <img src="https://i.pravatar.cc/40?img=45" alt="Kathryn Farmer" />
              </div>
              <div class="member-info">
                <span class="member-name">Kathryn Farmer</span>
                <span class="member-role">User</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="member-chart-icon">
                <path d="M2 12V10C2 8.89543 2.89543 8 4 8H6M10 8H12C13.1046 8 14 8.89543 14 10V12M10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6ZM4 6C4 7.10457 4.89543 8 6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6Z" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="team-group">
          <div class="team-header">
            <span class="team-name">Sales Team</span>
            <span class="team-members-count">23 members</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="team-icon">
              <path d="M2 12V10C2 8.89543 2.89543 8 4 8H6M10 8H12C13.1046 8 14 8.89543 14 10V12M10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6ZM4 6C4 7.10457 4.89543 8 6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6Z" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="teams-chart-container">
        <div class="chart-wrapper">
          <svg class="chart-svg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
            <!-- Y-axis labels -->
            <text x="30" y="20" class="axis-label">500</text>
            <text x="30" y="70" class="axis-label">400</text>
            <text x="30" y="120" class="axis-label">300</text>
            <text x="30" y="170" class="axis-label">200</text>
            <text x="30" y="220" class="axis-label">100</text>
            <text x="30" y="270" class="axis-label">0</text>

            <!-- Y-axis line -->
            <line x1="50" y1="20" x2="50" y2="280" stroke="#E5E7EB" stroke-width="1"/>

            <!-- X-axis labels -->
            <text x="120" y="295" class="axis-label">DEC 02, 2024</text>
            <text x="250" y="295" class="axis-label">DEC 03, 2024</text>
            <text x="380" y="295" class="axis-label">DEC 04, 2024</text>
            <text x="510" y="295" class="axis-label">DEC 05, 2024</text>
            <text x="640" y="295" class="axis-label">DEC 06, 2024</text>

            <!-- Grid lines -->
            <line x1="50" y1="70" x2="750" y2="70" stroke="#F3F4F6" stroke-width="1"/>
            <line x1="50" y1="120" x2="750" y2="120" stroke="#F3F4F6" stroke-width="1"/>
            <line x1="50" y1="170" x2="750" y2="170" stroke="#F3F4F6" stroke-width="1"/>
            <line x1="50" y1="220" x2="750" y2="220" stroke="#F3F4F6" stroke-width="1"/>

            <!-- Bars for DEC 02 -->
            <rect x="80" y="200" width="20" height="50" fill="#A78BFA" rx="2"/>
            <rect x="105" y="180" width="20" height="70" fill="#C4B5FD" rx="2"/>
            <rect x="130" y="150" width="20" height="100" fill="#F97316" rx="2"/>
            <rect x="155" y="140" width="20" height="110" fill="#FB923C" rx="2"/>
            <rect x="180" y="120" width="20" height="130" fill="#FDBA74" rx="2"/>
            <rect x="205" y="100" width="20" height="150" fill="#EC4899" rx="2"/>
            <rect x="230" y="60" width="20" height="190" fill="#10B981" rx="2"/>
            <rect x="255" y="80" width="20" height="170" fill="#34D399" rx="2"/>
            <rect x="280" y="90" width="20" height="160" fill="#3B82F6" rx="2"/>
            <rect x="305" y="110" width="20" height="140" fill="#EF4444" rx="2"/>

            <!-- Bars for DEC 03 -->
            <rect x="210" y="190" width="20" height="60" fill="#A78BFA" rx="2"/>
            <rect x="235" y="170" width="20" height="80" fill="#C4B5FD" rx="2"/>
            <rect x="260" y="140" width="20" height="110" fill="#F97316" rx="2"/>
            <rect x="285" y="130" width="20" height="120" fill="#FB923C" rx="2"/>
            <rect x="310" y="110" width="20" height="140" fill="#FDBA74" rx="2"/>
            <rect x="335" y="90" width="20" height="160" fill="#EC4899" rx="2"/>
            <rect x="360" y="50" width="20" height="200" fill="#10B981" rx="2"/>
            <rect x="385" y="70" width="20" height="180" fill="#34D399" rx="2"/>
            <rect x="410" y="80" width="20" height="170" fill="#3B82F6" rx="2"/>
            <rect x="435" y="100" width="20" height="150" fill="#EF4444" rx="2"/>

            <!-- Bars for DEC 04 -->
            <rect x="340" y="180" width="20" height="70" fill="#A78BFA" rx="2"/>
            <rect x="365" y="160" width="20" height="90" fill="#C4B5FD" rx="2"/>
            <rect x="390" y="130" width="20" height="120" fill="#F97316" rx="2"/>
            <rect x="415" y="120" width="20" height="130" fill="#FB923C" rx="2"/>
            <rect x="440" y="100" width="20" height="150" fill="#FDBA74" rx="2"/>
            <rect x="465" y="80" width="20" height="170" fill="#EC4899" rx="2"/>
            <rect x="490" y="40" width="20" height="210" fill="#10B981" rx="2"/>
            <rect x="515" y="60" width="20" height="190" fill="#34D399" rx="2"/>
            <rect x="540" y="70" width="20" height="180" fill="#3B82F6" rx="2"/>
            <rect x="565" y="90" width="20" height="160" fill="#EF4444" rx="2"/>

            <!-- Bars for DEC 05 -->
            <rect x="470" y="190" width="20" height="60" fill="#A78BFA" rx="2"/>
            <rect x="495" y="170" width="20" height="80" fill="#C4B5FD" rx="2"/>
            <rect x="520" y="140" width="20" height="110" fill="#F97316" rx="2"/>
            <rect x="545" y="130" width="20" height="120" fill="#FB923C" rx="2"/>
            <rect x="570" y="110" width="20" height="140" fill="#FDBA74" rx="2"/>
            <rect x="595" y="90" width="20" height="160" fill="#EC4899" rx="2"/>
            <rect x="620" y="50" width="20" height="200" fill="#10B981" rx="2"/>
            <rect x="645" y="70" width="20" height="180" fill="#34D399" rx="2"/>
            <rect x="670" y="80" width="20" height="170" fill="#3B82F6" rx="2"/>
            <rect x="695" y="100" width="20" height="150" fill="#EF4444" rx="2"/>

            <!-- Bars for DEC 06 -->
            <rect x="600" y="200" width="20" height="50" fill="#A78BFA" rx="2"/>
            <rect x="625" y="180" width="20" height="70" fill="#C4B5FD" rx="2"/>
            <rect x="650" y="150" width="20" height="100" fill="#F97316" rx="2"/>
            <rect x="675" y="140" width="20" height="110" fill="#FB923C" rx="2"/>
            <rect x="700" y="120" width="20" height="130" fill="#FDBA74" rx="2"/>
            <rect x="725" y="100" width="20" height="150" fill="#EC4899" rx="2"/>
            <rect x="750" y="60" width="20" height="190" fill="#10B981" rx="2"/>
            <rect x="775" y="80" width="20" height="170" fill="#34D399" rx="2"/>
            <rect x="800" y="90" width="20" height="160" fill="#3B82F6" rx="2"/>
            <rect x="825" y="110" width="20" height="140" fill="#EF4444" rx="2"/>
          </svg>
        </div>

        <!-- Legend -->
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color" style="background-color: #A78BFA;"></div>
            <span class="legend-label">Invites sent</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #C4B5FD;"></div>
            <span class="legend-label">Invites accepted</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #F97316;"></div>
            <span class="legend-label">Messages sent</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #FB923C;"></div>
            <span class="legend-label">Emails sent</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #FDBA74;"></div>
            <span class="legend-label">InMails sent</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #EC4899;"></div>
            <span class="legend-label">Leads replied</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #10B981;"></div>
            <span class="legend-label">Profiles viewed</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #34D399;"></div>
            <span class="legend-label">Profiles followed</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #3B82F6;"></div>
            <span class="legend-label">Liked</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #EF4444;"></div>
            <span class="legend-label">Endorsed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'TeamsChart',
  setup() {
    const selectedRange = ref('7days');
    
    const dateRanges = [
      { id: 'today', label: 'Today' },
      { id: 'yesterday', label: 'Yesterday' },
      { id: '7days', label: '7 days' },
      { id: '30days', label: '30 days' },
      { id: '3months', label: '3 months' },
      { id: 'pick', label: 'Pick dates' },
    ];

    return {
      selectedRange,
      dateRanges,
    };
  },
};
</script>

<style scoped>
.teams-chart {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.teams-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.teams-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-family: 'THICCCBOI', sans-serif;
}

.teams-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-range-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #F3F4F6;
  border-radius: 8px;
  padding: 4px;
}

.date-range-btn {
  padding: 6px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6B7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.date-range-btn:hover {
  color: #111827;
  background-color: white;
}

.date-range-btn.active {
  background-color: white;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.view-team-btn {
  padding: 8px 16px;
  background-color: #8B5CF6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.view-team-btn:hover {
  background-color: #7C3AED;
}

.teams-content {
  display: flex;
  gap: 32px;
}

.teams-list {
  flex: 0 0 300px;
}

.team-group {
  margin-bottom: 32px;
}

.team-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.team-members-count {
  font-size: 13px;
  color: #6B7280;
}

.team-icon {
  color: #A78BFA;
  flex-shrink: 0;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.team-member:hover {
  background-color: #F9FAFB;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.member-role {
  font-size: 12px;
  color: #6B7280;
}

.member-chart-icon {
  color: #A78BFA;
  flex-shrink: 0;
}

.teams-chart-container {
  flex: 1;
  min-width: 0;
}

.chart-wrapper {
  width: 100%;
  height: 300px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.chart-svg {
  width: 100%;
  height: 100%;
  min-width: 800px;
}

.axis-label {
  font-size: 12px;
  fill: #6B7280;
  font-family: 'THICCCBOI', sans-serif;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 12px;
  color: #6B7280;
  font-family: 'THICCCBOI', sans-serif;
}
</style>





