<script setup>
defineProps({
    digit: { type: String, required: true }
})
</script>

<template>
    <!--
        A dim 8 sits behind every digit to reserve the widest glyph's width.
        Without it the proportional LCD face makes the whole clock shuffle
        sideways as the numbers change. Inherited from the original app.
    -->
    <span class="digit">
        <span class="digit__ghost" aria-hidden="true">8</span>
        <span class="digit__value">{{ digit }}</span>
    </span>
</template>

<style scoped>
.digit {
    display: inline-block;
    position: relative;
}

.digit__ghost {
    color: var(--digit-ghost);
}

.digit__value {
    color: var(--digit);
    inset: 0;
    position: absolute;
    text-align: center;
    text-shadow: var(--glow);
}
</style>
