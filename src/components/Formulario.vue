<template>


<div class="container_header">
    <el-row justify="center" align="middle">
       

    </el-row>

    <slot name="slotForm" ></slot>
    </div>



</template>



<script setup>

defineProps({
  titulo: String,
  
})

</script>


<style scoped>
</style>