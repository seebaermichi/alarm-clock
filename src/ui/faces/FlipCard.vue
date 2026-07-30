<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    digit: { type: String, required: true },
    small: { type: Boolean, default: false }
})

/**
 * While flipping, the card renders as four layers, the classic split-flap
 * mechanism: static top half (new digit), static bottom half (old digit),
 * a top flap of the old digit swinging away, then a bottom flap of the new
 * digit swinging down. `flip` holds the pair; the :key restarts the CSS
 * animations on every change.
 */
const flip = ref(null)
let flips = 0

watch(
    () => props.digit,
    (to, from) => {
        flips += 1
        flip.value = { from, to, id: flips }
    }
)
</script>

<template>
    <span class="card" :class="{ 'card--s': small }">
        <template v-if="flip">
            <span class="half half--top"><span class="half__digit">{{ flip.to }}</span></span>
            <span class="half half--bottom"><span class="half__digit">{{ flip.from }}</span></span>
            <span :key="`t${flip.id}`" class="half half--top flap flap--top" aria-hidden="true">
                <span class="half__digit">{{ flip.from }}</span>
            </span>
            <span
                :key="`b${flip.id}`"
                class="half half--bottom flap flap--bottom"
                aria-hidden="true"
                @animationend="flip = null"
            >
                <span class="half__digit">{{ flip.to }}</span>
            </span>
        </template>
        <span v-else class="card__digit">{{ digit }}</span>
    </span>
</template>

<style scoped>
.card {
    align-items: center;
    background: var(--sf-card);
    border: 1px solid var(--sf-card-border);
    border-radius: 10px;
    box-shadow: var(--sf-shadow);
    display: flex;
    height: var(--sf-card-h, 132px);
    justify-content: center;
    perspective: 320px;
    position: relative;
    width: var(--sf-card-w, 92px);
}

.card__digit,
.half__digit {
    color: var(--digit);
    font-size: var(--sf-card-fs, 84px);
    font-weight: 700;
    line-height: 1;
}

/* Seam line at 50%, above the flaps. */
.card::after {
    background: var(--sf-seam);
    content: '';
    height: 3px;
    left: 0;
    margin-top: -1px;
    position: absolute;
    right: 0;
    top: 50%;
    z-index: 2;
}

.card--s {
    height: var(--sf-card-sh, 82px);
    width: var(--sf-card-sw, 56px);
}

.card--s .card__digit,
.card--s .half__digit {
    color: var(--digit-dim);
    font-size: var(--sf-card-sfs, 48px);
}

.card--s::after {
    height: 2px;
}

.card--s .half,
.card--s .flap {
    background: var(--sf-card-sm);
}

.half {
    background: var(--sf-card);
    display: block;
    left: 0;
    overflow: hidden;
    position: absolute;
    right: 0;
}

.half--top {
    border-radius: 10px 10px 0 0;
    top: 0;
    height: 50%;
}

.half--bottom {
    border-radius: 0 0 10px 10px;
    bottom: 0;
    height: 50%;
}

/* Each half shows a full-height glyph, clipped to its own 50%. */
.half__digit {
    align-items: center;
    display: flex;
    height: 200%;
    justify-content: center;
    left: 0;
    position: absolute;
    right: 0;
}

.half--top .half__digit {
    top: 0;
}

.half--bottom .half__digit {
    bottom: 0;
}

.flap {
    backface-visibility: hidden;
    z-index: 1;
}

.flap--top {
    animation: flip-top 150ms ease-in both;
    transform-origin: bottom;
}

.flap--bottom {
    animation: flip-bottom 150ms ease-out 150ms both;
    transform-origin: top;
}

@keyframes flip-top {
    from {
        transform: rotateX(0);
    }

    to {
        transform: rotateX(-90deg);
    }
}

@keyframes flip-bottom {
    from {
        transform: rotateX(90deg);
    }

    to {
        transform: rotateX(0);
    }
}
</style>
