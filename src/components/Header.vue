<template>
    <div class="container">
        
        <div class="container_header">
            <h2 class="titulo">Modulo de {{titulo}}</h2>
            <el-row justify="center" align="middle">
                <el-button type="primary">{{ tituloBoton }}</el-button>
    
            </el-row>

        </div>


    </div>

</template>



<script setup>

defineProps({
  titulo: String,
  tituloBoton: String,
  
})

</script>


<style scoped>
.container{
    margin-bottom: 10px;
}

.container_header{
    display: flex;
    justify-content: space-between;
    padding: 0px;
}



</style>