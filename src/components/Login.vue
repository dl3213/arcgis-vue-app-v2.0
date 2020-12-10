<template>
    <div class="login">
    
        <form class="box">
    
            <h1>Login</h1>
    
            <input type="text" placeholder="Username" />
    
            <input type="password" placeholder="Password" />
    
            <input type="submit" value="login" @click="login" />
    
        </form>
    
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class Login extends Vue {
    login() {
        console.log("logining ......");
    }
    mounted() {
        var _self = this;
        document.onkeydown = function(e: any) {
            var key = (window as any).event.keyCode;
            if (key == 13) {
                _self.login();
            }
        };
    }
}
</script>

<style lang="stylus" scoped>
.login {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background: #34495e;
}

.box {
  width: 23%;
  height: 50%;
  padding: 1%;
  position: absolute;
  top: 50%;
  left: 50%;
  background: #191919;
  transform: translate(-50%, -50%);
  text-align: center;
}

.box h1 {
  margin-top: 15%;
  margin-bottom: 10%;
  color: white;
  text-transform: uppercase;
  font-weight: 500;
}

.box input[type='text'], .box input[type='password'] {
  background: none;
  display: block;
  margin: 20px auto;
  margin-bottom: 40px;
  text-align: center;
  font-size: 20px;
  border: 3px solid #3498db;
  padding: 4% 10px;
  width: 60%;
  outline: none;
  color: white;
  border-radius: 24px;
  transition: 0.25s;

  &:focus {
    width: @width + @width * 0.2;
    border-color: #2ecc71;
  }
}

.box input[type='submit'] {
  background: none;
  display: block;
  margin: 20px auto;
  text-align: center;
  font-size: 23px;
  border: 3px solid #2ecc71;
  padding: 14px 40px;
  outline: none;
  color: white;
  border-radius: 24px;
  transition: 0.25s;
  cursor: pointer;

  &:hover {
    background: #2ecc71;
  }
}
</style>
