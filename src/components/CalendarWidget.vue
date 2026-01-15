<template>
  <WidgetCard title="日历">
    <div class="calendar-widget">
      <div class="calendar-header">
        <button class="calendar-nav" @click="prevMonth">&lt;</button>
        <span class="calendar-month">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
        <button class="calendar-nav" @click="nextMonth">&gt;</button>
      </div>
      <div class="calendar-days">
        <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
      </div>
      <div class="calendar-dates">
        <div 
          class="calendar-date" 
          v-for="(date, index) in calendarDates" 
          :key="index"
          :class="{ 
            'today': isToday(date),
            'other-month': date.month !== currentMonth
          }"
        >
          {{ date.day }}
        </div>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import WidgetCard from './WidgetCard.vue';

const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());

const calendarDates = computed(() => {
  const dates = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const daysInPrevMonth = prevLastDay.getDate();
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    dates.push({
      day: daysInPrevMonth - i,
      month: currentMonth.value - 1
    });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push({
      day: i,
      month: currentMonth.value
    });
  }
  
  const remainingDays = 42 - dates.length;
  for (let i = 1; i <= remainingDays; i++) {
    dates.push({
      day: i,
      month: currentMonth.value + 1
    });
  }
  
  return dates;
});

const isToday = (date) => {
  const today = new Date();
  return date.day === today.getDate() && 
         date.month === today.getMonth() && 
         currentYear.value === today.getFullYear();
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};
</script>

<style scoped>
.calendar-widget {
  text-align: center;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-nav {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.calendar-nav:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.calendar-month {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.day-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 8px 0;
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-date {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
  font-size: 14px;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.calendar-date:hover:not(.other-month) {
  background: rgba(255, 255, 255, 0.2);
}

.calendar-date.today {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-date.other-month {
  color: rgba(255, 255, 255, 0.4);
}
</style>
