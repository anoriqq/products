<template lang="pug">
  h1 {{message}}
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';

@Component
export default class App extends Vue {
  message = 'This is a data';
};
</script>
