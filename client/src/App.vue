<template>
  <div id="app">
    <el-container>
      <el-header height="13em">
        <img src="./assets/logo.png" class="logo">
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
      <el-footer class="footer">
        <p>Secure Remote Hashing Server - IT Engineering Course @ IUT</p>
        <p class="liner">Made by <a href="https://www.github.com/KayvanMazaheri">Kayvan Mazaheri</a> | Source Code Available @ <a href="https://www.github.com/KayvanMazaheri/hash-server">GitHub</a></p>
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
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: default;

  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-bottom: 3em;
}
img.logo {
  height: 12em
}
p.liner {
  overflow: hidden;
  text-align: center;
  color: #606266;
}
p.liner:before,
p.liner:after {
  background-color: #DCDFE6;
  content: "";
  display: inline-block;
  height: 1px;
  position: relative;
  vertical-align: middle;
  width: 40%;
}

p.liner:before {
  right: 0.5em;
  /* left: 1em; */
  margin-left: -50%;
}

p.liner:after {
  left: 0.5em;
  /* right: 1em; */
  margin-right: -50%;
}

.footer {
  margin-bottom: 3em;
}
</style>
