<template>
  <div id="app">
    <!-- <Login /> -->
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>|
      <router-link to="/arcgis">Arcgis</router-link>
    </div>

    <keep-alive include="Arcgis">
      <router-view />
    </keep-alive>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Home from "@/views/Home.vue";
import Login from "@/components/Login.vue";

@Component({
  components: {
    Login,
    Home
  }
})
export default class App extends Vue {
  mounted() {
    if (this._isMobile()) {
      console.log("手机端");
      alert("手机端");
    } else {
      console.log("pc端");
    }
  }

  _isMobile() {
    let flag = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    );
    return flag;
  }
}
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  /* background: #34495e; */
}

#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
