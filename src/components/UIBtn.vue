<template>
  <div>
    <!-- <button class="ui-btn" v-on="$listeners">BTN</button>  -->
    <button class="ui-btn" @click="onClick" 
    :class="{
        'ui-btn-large':large
    }">
      <slot>BTN</slot>
    </button>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit, Prop } from "vue-property-decorator";

@Component
export default class UIBtn extends Vue {

  @Prop(Boolean)
  private large: boolean | undefined;

  @Emit("click")
  private emitClickEvt(evt: MouseEvent) {}

    private mounted(){
        console.log(this.large);
        
    }

  private onClick(evt: MouseEvent) {
    this.emitClickEvt(evt);
  }
}
</script>

<style scoped>

.ui-btn {
  min-width: 64px;
  height: 36px;
  padding: 0 16px;
  border: 0 solid black;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.09em;
  outline: none;
  background-color: #2d8cf0;
  user-select: none;
  cursor: pointer;
}
.ui-btn-large{
     min-width: 78px;
  height: 44px;
  padding: 0 19px;
}
</style>
