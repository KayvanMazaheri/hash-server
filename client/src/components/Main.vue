<template lang="html">
  <el-row type="flex" justify="center">
    <el-col :span="15">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <h1>Hash Server</h1>
        </div>
        <el-container
          v-loading="!connected"
          element-loading-text="Connecting to server ...">
          <el-header>
            <el-steps :active="step" align-center>
              <el-step title="Configure" icon="el-icon-setting"></el-step>
              <el-step title="Authenticate" icon="el-icon-view"></el-step>
              <el-step title="Use Service" icon="el-icon-service"></el-step>
            </el-steps>
          </el-header>
          <el-main>
            <div id="config">
              <p>This client needs an RSA key pair to be able to communicate with the server in a secure way.</p>

              <el-form ref="configForm" :model="config" label-width="120px">
                <el-form-item label="Public Key">
                  <el-input
                    type="textarea"
                    :rows="2"
                    placeholder="Please Enter Your Public Key Here"
                    v-model="config.publicKey">
                  </el-input>
                </el-form-item>
                <el-form-item label="Private Key">
                  <el-input
                    type="textarea"
                    :rows="2"
                    placeholder="Please Enter Your Private Key Here"
                    v-model="config.privateKey">
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="onSubmit">Save Configuration</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-input
              type="textarea"
              :rows="2"
              placeholder="Please input"
              v-model="text">
            </el-input>
          </el-main>
        </el-container>
      </el-card>
    </el-col>
  </el-row>

</template>

<script>
export default {
  data () {
    return {
      connected: false,
      text: '',
      step: -1,
      config: {
        publicKey: '',
        privateKey: ''
      }
    }
  },
  sockets: {
    connect () {
      this.$notify({
        title: 'Connected',
        message: 'Client connected to the server.',
        type: 'success'
      })
      this.connected = true
      this.step = 0
    },
    disconnect () {
      this.$notify.error({
        title: 'Disconnected',
        message: 'Client disconnected from the server.'
      })
      this.connected = false
      this.step = -1
    }
  }
}
</script>

<style lang="css" scoped>
>>> .is-finish {
  color: #67C23A;
  border-color: #67C23A;
}
</style>
