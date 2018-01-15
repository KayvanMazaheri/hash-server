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
            <transition
              name="fade"
              enter-active-class="animated fadeInUp"
              leave-active-class="animated zoomOut"
              mode="out-in"
              appear>
              <div id="config" v-if="step == 0" key="config">
                <p>This client needs an RSA key pair to be able to communicate with the server in a secure way.</p>

                <el-form ref="configForm" :rules="configRules" :model="client" label-width="120px">
                  <el-form-item label="Public Key" prop="publicKey">
                    <el-input
                      :disabled="loadings.configBtn"
                      type="textarea"
                      :rows="4"
                      placeholder="Please Enter Your Public Key Here"
                      v-model="client.publicKey">
                    </el-input>
                  </el-form-item>
                  <el-form-item label="Private Key" prop="privateKey">
                    <el-input
                      :disabled="loadings.configBtn"
                      type="textarea"
                      :rows="6"
                      placeholder="Please Enter Your Private Key Here"
                      v-model="client.privateKey">
                    </el-input>
                  </el-form-item>
                  <el-button :loading="loadings.configBtn" type="primary" @click="handshake">Save Configuration</el-button>
                </el-form>
              </div>
              <div id="auth" v-if="step == 1" key="auth">
                <transition
                  name="fade"
                  enter-active-class="animated zoomIn"
                  leave-active-class="animated zoomOut"
                  mode="out-in"
                  appear>

                  <el-form ref="authForm" :rules="authRules" :model="auth" label-width="120px" v-if="!auth.switchLoginSignup" key="1">
                    <el-form-item label="Username" prop="username">
                      <el-input :disabled="loadings.authBtn" v-model="auth.username" ></el-input>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="password">
                       <el-input :disabled="loadings.authBtn" type="password" v-model="auth.password" auto-complete="off" ></el-input>
                    </el-form-item>
                    <el-button :loading="loadings.authBtn" type="primary" @click="basicAuthenticate">Authenticate</el-button>
                    <p class="liner"> OR </p>
                    <el-button :disabled="true" :loading="loadings.authBtn" type="success" @click="passwordlessAuthenticate">Authenticate Without Password</el-button>
                  </el-form>
                  <el-form ref="authFormSignup" :rules="registerRules" :model="auth" label-width="120px" v-if="auth.switchLoginSignup" key="2">
                    <el-form-item label="Username"  prop="username">
                      <el-input :disabled="loadings.registerBtn" v-model="auth.username"></el-input>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="password">
                       <el-input :disabled="loadings.registerBtn" type="password" v-model="auth.password" auto-complete="off" ></el-input>
                    </el-form-item>
                    <el-form-item label="Confirm" prop="passwordConfirmation">
                       <el-input :disabled="loadings.registerBtn" type="password" v-model="auth.passwordConfirmation" auto-complete="off" ></el-input>
                    </el-form-item>
                    <el-button :loading="loadings.registerBtn" type="success" @click="register">Register</el-button>
                  </el-form>
                </transition>
                <el-button id="switchLoginSignup" type="text" @click="switchLoginSignup">{{switchLoginSignupText}}</el-button>
              </div>
              <div id="hash" v-if="step == 2" key="hash">

                <el-form ref="hashForm" :rules="hashRules" :model="hash" label-width="120px">
                  <el-form-item label="Value to Hash" prop="text">
                    <el-input type="textarea"
                      :disabled="loadings.hashBtn"
                      v-model="hash.text"
                      :rows="4"
                      placeholder="Enter The Text You Need To Hash"
                      >
                    </el-input>
                  </el-form-item>
                  <el-button :loading="loadings.hashBtn" type="primary" @click="hashReq" plain>Request Hash</el-button>
                  <el-dialog
                    title="Hashed Value"
                    :visible.sync="hash.showDialog"
                    width="40%"
                    center>
                    <p>{{hash.hashedValue}}</p>
                  </el-dialog>
                </el-form>
                <el-button id="finBtn" type="danger" @click="fin">Fin</el-button>
            </div>
          </transition>
          </el-main>
        </el-container>
      </el-card>
    </el-col>
  </el-row>

</template>

<script>
import RSA from '../helpers/rsa'
import AES from '../helpers/aes'

export default {
  data () {
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please input the password again'))
      } else if (value !== this.auth.password) {
        callback(new Error('Two inputs don\'t match!'))
      } else {
        callback()
      }
    }
    return {
      loadings: {
        configBtn: false,
        registerBtn: false,
        authBtn: false,
        hashBtn: false
      },
      connected: false,
      step: -1,
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
      },
      hash: {
        showDialog: false,
        text: '',
        hashedValue: 'Loading ...'
      },
      configRules: {
        publicKey: [
          { required: true, message: 'Please enter a public key' }
        ],
        privateKey: [
          { required: true, message: 'Please enter a private key' }
        ]
      },
      hashRules: {
        text: [
          { required: true, message: 'This field can not be empty' }
        ]
      },
      authRules: {
        username: [
          { required: true, message: 'Please enter your username' }
        ],
        password: [
          { required: true, message: 'Please enter your password' }
        ]
      },
      registerRules: {
        username: [
          { required: true, message: 'Please enter your username' }
        ],
        password: [
          { required: true, message: 'Please enter your password' }
        ],
        passwordConfirmation: [
          { validator: validatePass2, trigger: 'blur' }
        ]
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
      this.$refs['configForm'].validate(valid => {
        if (valid) {
          this.loadings.configBtn = true
          this.$socket.emit('handshake', { publicKey: this.client.publicKey })
        } else {
          return false
        }
      })
    },
    fin () {
      this.$socket.emit('fin')
    },
    hashReq () {
      this.$refs['hashForm'].validate(valid => {
        if (valid) {
          this.hash.showDialog = false
          this.loadings.hashBtn = true
          let hashRequest = this.hash.text

          let request = {
            data: hashRequest,
            sign: null
          }

          AES.encryptMessage(this.common.aesKey, JSON.stringify(request)).then(encryptedRequest => {
            this.$socket.emit('hash', encryptedRequest)
          })
        } else {
          return false
        }
      })
    },
    basicAuthenticate () {
      this.$refs['authForm'].validate(valid => {
        if (valid) {
          this.loadings.authBtn = true
          let authRequest = {
            username: this.auth.username,
            password: this.auth.password
          }

          let request = {
            data: authRequest,
            sign: null
          }

          AES.encryptMessage(this.common.aesKey, JSON.stringify(request)).then(encryptedRequest => {
            this.$socket.emit('auth', encryptedRequest)
          })
        } else {
          return false
        }
      })
    },
    passwordlessAuthenticate () {},
    register () {
      this.$refs['authFormSignup'].validate(valid => {
        if (valid) {
          this.loadings.registerBtn = true
          let registerRequest = {
            username: this.auth.username,
            password: this.auth.password
          }

          let request = {
            data: registerRequest,
            sign: null
          }

          AES.encryptMessage(this.common.aesKey, JSON.stringify(request)).then(encryptedRequest => {
            this.$socket.emit('register', encryptedRequest)
          })
        } else {
          return false
        }
      })
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
    err (err) {
      this.$notify.error({
        title: 'Error',
        message: err
      })
      this.loadings = {
        configBtn: false,
        registerBtn: false,
        authBtn: false,
        hashBtn: false
      }
    },
    hash (data) {
      AES.decryptMessage(this.common.aesKey, data.encryptedResponse).then(hashedValue => {
        hashedValue = JSON.parse(hashedValue)
        // console.log(`Authenticated ${isAuthenticated}`)
        this.hash.hashedValue = hashedValue.data

        this.loadings.hashBtn = false
        this.hash.showDialog = true
      })
    },
    handshake (data) {
      // console.log(`handshake: \n${JSON.stringify(data)}`)
      RSA.privateDecrypt(this.client.privateKey, data.encryptedAESKey).then(decryptedAESKey => {
        // console.log(`decrypted aes key is ${JSON.stringify(Buffer.from(decryptedAESKey))}`)
        this.common.aesKey = decryptedAESKey
        AES.decryptMessage(decryptedAESKey, data.encryptedHandshakePackage).then(handshakePackage => {
          handshakePackage = JSON.parse(handshakePackage)
          // console.log(`handshake package: \n${(handshakePackage.sign)}`)
          this.server.publicKey = handshakePackage.data.server.publicKey
          this.common.nonce = handshakePackage.data.server.nonce
          // console.log(this.server.publicKey)
          // RSA.verify(this.server.publicKey, JSON.stringify(handshakePackage.data), handshakePackage.sign).then(verified => {
          //   console.log(`handshake verification: ${verified}`)
          // })
          this.step = 1
          this.loadings.configBtn = false
        })
      })
    },
    register (data) {
      AES.decryptMessage(this.common.aesKey, data.encryptedResponse).then(decryptedData => {
        decryptedData = JSON.parse(decryptedData)

        this.$notify({
          title: 'Registered',
          message: 'New user registered successfully. Now you can login using your username and password.',
          type: 'success'
        })
        this.auth.switchLoginSignup = false
        this.loadings.registerBtn = false
      })
    },
    auth (data) {
      AES.decryptMessage(this.common.aesKey, data.encryptedResponse).then(isAuthenticated => {
        isAuthenticated = JSON.parse(isAuthenticated)
        // console.log(`Authenticated ${isAuthenticated}`)
        if (isAuthenticated.data) {
          this.$notify({
            title: 'Authenticated',
            message: 'Successfully authenticated! Now you can use this client to send hash requests.',
            type: 'success'
          })
          this.step = 2
        } else {
          this.$notify.error({
            title: 'Authentication Failed',
            message: 'Please try again.'
          })
        }

        this.loadings.authBtn = false
      })
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
  margin-top: 1em;
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

button#finBtn {
  margin-top: 2em;
  width: 5em;
  position: relative;
  margin-right: -90%;
}

>>> .box-card {
  -moz-transition: all .5s linear;
  -webkit-transition: all .5s linear;
  -moz-transition: all .5s linear;
  -o-transition: all .5s linear;
  transition: all .5s linear;

  min-height: 40em;
}

</style>
