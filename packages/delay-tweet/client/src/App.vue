<template lang="pug">
  .App
    h1 {{message}}
    h3 {{time}}
    v-btn(
      class="ma-2"
      :loading="loading"
      :disabled="loading"
      @click="click"
    ) Tweet
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';

@Component
export default class App extends Vue {
  message: string = 'This is a data';
  time: Date = new Date();
  loading: boolean = false;

  mounted(){
    return this.setTime();
  };

  setTime(){
    return setInterval(()=>{
      return this.time = new Date();
    }, 100);
  };
  click(){
    this.loading = true;
    setTimeout(()=>{this.loading = false}, 3000);
  };
};
</script>
