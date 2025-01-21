import {ref} from 'vue';

export function useDraggable(articleListRef) {
    const startY = ref(0);
    const currentY = ref(0);
    const isDragging = ref(false);
    const maxScroll = ref(0);

    // 计算最大滚动范围
    const calculateMaxScroll = () => {
        if (articleListRef.value) {
            maxScroll.value = articleListRef.value.clientHeight - articleListRef.value.scrollHeight;
        }
    };

    // 滑动事件处理
    const onTouchStart = (event) => {
        if (!articleListRef.value) return;
        startY.value = event.touches[0].pageY - currentY.value;
        isDragging.value = true;
    };

    const onTouchMove = (event) => {
        if (!isDragging.value || !articleListRef.value) return;

        currentY.value = event.touches[0].pageY - startY.value;
        if (currentY.value > 0) {
            currentY.value /= 2;
        } else if (currentY.value < maxScroll.value) {
            currentY.value = maxScroll.value + (currentY.value - maxScroll.value) / 2;
        }

        articleListRef.value.style.transform = `translateY(${currentY.value}px)`;
    };

    const onTouchEnd = () => {
        if (!isDragging.value || !articleListRef.value) return;

        isDragging.value = false;
        if (currentY.value > 0) {
            currentY.value = 0;
        } else if (currentY.value < maxScroll.value) {
            currentY.value = maxScroll.value;
        }

        articleListRef.value.style.transition = 'transform 0.3s ease';
        articleListRef.value.style.transform = `translateY(${currentY.value}px)`;

        // Reset the transition after animation
        setTimeout(() => {
            articleListRef.value.style.transition = '';
        }, 300);
    };

    // 绑定事件
    const bindTouchEvents = () => {
        if (!articleListRef.value) return;

        articleListRef.value.addEventListener('touchstart', onTouchStart);
        articleListRef.value.addEventListener('touchmove', onTouchMove);
        articleListRef.value.addEventListener('touchend', onTouchEnd);
    };

    const unbindTouchEvents = () => {
        if (!articleListRef.value) return;

        articleListRef.value.removeEventListener('touchstart', onTouchStart);
        articleListRef.value.removeEventListener('touchmove', onTouchMove);
        articleListRef.value.removeEventListener('touchend', onTouchEnd);
    };

    return {
        calculateMaxScroll,
        bindTouchEvents,
        unbindTouchEvents,
    };
}
