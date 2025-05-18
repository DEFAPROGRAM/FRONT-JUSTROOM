<template>
    <div class="container">
        
        <div class="container_header">
            <h2 class="titulo">{{titulo}}</h2>
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

.titulo {
    font-size: 1.5rem;
    color: #606266;
    margin: 0;
    display: flex;
    align-items: center;
}

</style>