import { ref } from 'vue';

export function useTouchScroll() {
    const startY = ref(0);
    const currentY = ref(0);
    const isDragging = ref(false);
    const maxScroll = ref(0);

    const onTouchStart = (event) => {
        startY.value = event.touches[0].pageY - currentY.value;
        isDragging.value = true;
    };

    const onTouchMove = (event) => {
        if (!isDragging.value) return;
        currentY.value = event.touches[0].pageY - startY.value;
        if (currentY.value > 0) {
            currentY.value /= 2;
        } else if (currentY.value < maxScroll.value) {
            currentY.value = maxScroll.value + (currentY.value - maxScroll.value) / 2;
        }
    };

    const onTouchEnd = () => {
        if (!isDragging.value) return;
        isDragging.value = false;
        if (currentY.value > 0) {
            currentY.value = 0;
        } else if (currentY.value < maxScroll.value) {
            currentY.value = maxScroll.value;
        }
    };

    return { currentY, onTouchStart, onTouchMove, onTouchEnd };
}
