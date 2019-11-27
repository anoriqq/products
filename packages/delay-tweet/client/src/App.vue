<template lang="pug">
  h1 {{message}}
</template>

<script lang="ts">
import Vue from 'vue';

export default class MyComp extends Vue {
  message = 'Hello';
};
</script>

<style lang="stylus" scoped>

</style>
