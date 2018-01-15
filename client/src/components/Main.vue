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
            <div id="config" v-if="step == 0">
              <p>This client needs an RSA key pair to be able to communicate with the server in a secure way.</p>

              <el-form ref="configForm" :model="client" label-width="120px">
                <el-form-item label="Public Key">
                  <el-input
                    type="textarea"
                    :rows="4"
                    placeholder="Please Enter Your Public Key Here"
                    v-model="client.publicKey">
                  </el-input>
                </el-form-item>
                <el-form-item label="Private Key">
                  <el-input
                    type="textarea"
                    :rows="6"
                    placeholder="Please Enter Your Private Key Here"
                    v-model="client.privateKey">
                  </el-input>
                </el-form-item>
                <el-button type="primary" @click="handshake">Save Configuration</el-button>
              </el-form>
            </div>
            <div id="auth" v-if="step == 1">
              <transition
                name="fade"
                enter-active-class="animated zoomIn"
                leave-active-class="animated zoomOut"
                mode="out-in"
                appear>

                <el-form ref="authForm" :model="auth" label-width="120px" v-if="!auth.switchLoginSignup" key="1">
                  <el-form-item label="Username">
                    <el-input v-model="auth.username"></el-input>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="Password">
                     <el-input type="password" v-model="auth.password" auto-complete="off"></el-input>
                  </el-form-item>
                  <el-button type="primary" @click="basicAuthenticate">Authenticate</el-button>
                  <p class="liner"> OR </p>
                  <el-button type="success" @click="passwordlessAuthenticate">Authenticate Without Password</el-button>
                </el-form>
                <el-form ref="authFormSignup" :model="auth" label-width="120px" v-if="auth.switchLoginSignup" key="2">
                  <el-form-item label="Username">
                    <el-input v-model="auth.username"></el-input>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="Password">
                     <el-input type="password" v-model="auth.password" auto-complete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="Confirm">
                     <el-input type="password" v-model="auth.passwordConfirmation" auto-complete="off"></el-input>
                  </el-form-item>
                  <el-button type="success" @click="register">Register</el-button>
                </el-form>
              </transition>
              <el-button id="switchLoginSignup"type="text" @click="switchLoginSignup">{{switchLoginSignupText}}</el-button>
            </div>
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
      connected: true,
      text: '',
      step: 1,
      client: {
        publicKey: '',
        privateKey: ''
      },
      server: {
        publicKey: ''
      },
      common: {
        aesKey: '',
        nonce: ''
      },
      auth: {
        switchLoginSignup: false,
        username: '',
        password: '',
        passwordConfirmation: ''
      }
    }
  },
  computed: {
    switchLoginSignupText () {
      return (this.auth.switchLoginSignup ? 'Already have an account?' : 'Don\'t have an account yet?')
    }
  },
  methods: {
    switchLoginSignup () {
      this.auth.switchLoginSignup = !this.auth.switchLoginSignup
    },
    handshake () {
      this.$socket.emit('handshake', { publicKey: this.client.publicKey })
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
    },
    error (err) {
      this.$notify.error({
        title: 'Error',
        message: err
      })
    },
    handshake (data) {
      console.log(`handshake: \n${JSON.stringify(data)}`)
    }
  }
}
</script>

<style lang="css" scoped>
>>> .is-finish {
  color: #67C23A;
  border-color: #67C23A;
}
button {
  width: 60%;
}
p.liner {
  overflow: hidden;
  text-align: center;
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

#switchLoginSignup {
  padding-top: 3em;
}
/*
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
} */

</style>
