<template lang="pug">
  .App
    h1 {{message}}
    h3 {{time}}
    v-container(fluid)
      v-textarea(
        v-model="text"
        name="name"
        fluid
        label="Label"
        auto-grow
      )
    v-btn(
      class="ma-2"
      :loading="loading"
      :disabled="loading"
      @click="click"
    ) Tweet
    a(href="/auth/twitter") ログイン
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator';

@Component
export default class App extends Vue {
  message: string = 'This is a data';
  time: Date = new Date();
  loading: boolean = false;
  text: string = '';

  mounted(){
    return this.setTime();
  };

  setTime(){
    return setInterval(()=>{
      return this.time = new Date();
    }, 100);
  };
  async click(){
    this.loading = true;
    const data = {
      text: this.text,
    };
    const body = await fetch('/api/tweet', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    })
      .then(async response=>{
        this.loading = false;
        const body = await response.json();
        if(!body.ok) throw body;
        this.text = '';
        return body;
      })
      .catch(console.log);
    if(!body) return;
    return console.log(body);
  };
};
</script>

<style lang="sass" scoped>
.App
  color: red
</style>
