<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js+TypeScript App"/>

    <!-- <UIBtn @click="btnClick" large>dddd</UIBtn> -->
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import { Vue, Component } from "vue-property-decorator";
import HelloWorld from '@/components/HelloWorld.vue'
// import UIBtn from "@/components/UIBtn.vue"


@Component({
  components:{
    HelloWorld,
    // UIBtn
  }
})
export default class Home extends Vue{
    private btnClick(evt:MouseEvent){
      console.log("btnclick");
      console.log(evt);
      
      
    }
}

// export default {
//   name: 'Home',
//   components: {
//     HelloWorld
//   }
// }
</script>
