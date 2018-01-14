<template>
  <div id="app">
    <el-container>
      <el-header height="13em">
        <img src="./assets/logo.png" class="logo">
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
      <el-footer>
        <p>Secure Remote Hashing Server - IT Engineering Course @ IUT</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
html {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
img.logo {
  height: 12em
}
</style>
