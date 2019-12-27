<template lang="pug">
  .App {{title}}
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';

@Component
export default class App extends Vue {
  title: string = 'HELLO WORLD!!';
};
</script>

<style lang="sass" scoped>
.App
  color: blue
</style>
