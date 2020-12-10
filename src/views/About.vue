<template>
    <div class="about">
        <h1>This is an about page</h1>
        <div><input type="text"></div>
        <div id="echarts" class="echarts" ref="echarts"></div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import echarts from 'echarts'

import {request} from '../tools/axios'


@Component({
    name: "About"
})
export default class About extends Vue {

    created(){
      console.log("created");

      request({
          url:"gis?name=100000.json"
      },null).then((res:any) => {
          console.log(res);
          
      }).catch((err:any) => {
          console.log(err);
          
      })
    }

    mounted() {
        console.log("mounted");
        console.log(this);
        // 基于准备好的dom，初始化echarts实例
        // var myChart = echarts.init(this.$refs.echarts);

        // 指定图表的配置项和数据
        var option = {
            title: {
                text: 'ECharts 入门示例'
            },
            tooltip: {},
            legend: {
                data:['销量']
            },
            xAxis: {
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20]
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        // myChart.setOption(option);

    }
}
</script>

<style scoped>
.about {
    width: 100%;
    height: 100%;
}

.echarts {
    width: 90%;
    height: 100%;
}
</style>