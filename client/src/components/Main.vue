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
                    :disabled="loadings.configBtn"
                    type="textarea"
                    :rows="4"
                    placeholder="Please Enter Your Public Key Here"
                    v-model="client.publicKey">
                  </el-input>
                </el-form-item>
                <el-form-item label="Private Key">
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
            <div id="auth" v-if="step == 1">
              <transition
                name="fade"
                enter-active-class="animated zoomIn"
                leave-active-class="animated zoomOut"
                mode="out-in"
                appear>

                <el-form ref="authForm" :model="auth" label-width="120px" v-if="!auth.switchLoginSignup" key="1">
                  <el-form-item label="Username">
                    <el-input :disabled="loadings.authBtn" v-model="auth.username"></el-input>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="Password">
                     <el-input :disabled="loadings.authBtn" type="password" v-model="auth.password" auto-complete="off"></el-input>
                  </el-form-item>
                  <el-button :loading="loadings.authBtn" type="primary" @click="basicAuthenticate">Authenticate</el-button>
                  <p class="liner"> OR </p>
                  <el-button :loading="loadings.authBtn" type="success" @click="passwordlessAuthenticate">Authenticate Without Password</el-button>
                </el-form>
                <el-form ref="authFormSignup" :model="auth" label-width="120px" v-if="auth.switchLoginSignup" key="2">
                  <el-form-item label="Username">
                    <el-input :disabled="loadings.registerBtn" v-model="auth.username"></el-input>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="Password">
                     <el-input :disabled="loadings.registerBtn" type="password" v-model="auth.password" auto-complete="off"></el-input>
                  </el-form-item>
                  <el-form-item label="Confirm">
                     <el-input :disabled="loadings.registerBtn" type="password" v-model="auth.passwordConfirmation" auto-complete="off"></el-input>
                  </el-form-item>
                  <el-button :loading="loadings.registerBtn" type="success" @click="register">Register</el-button>
                </el-form>
              </transition>
              <el-button id="switchLoginSignup" type="text" @click="switchLoginSignup">{{switchLoginSignupText}}</el-button>
            </div>
            <div id="hash" v-if="step == 2">

                <el-form ref="hashForm" :model="hash" label-width="120px">
                  <el-form-item label="Value to Hash">
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
            </div>
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
        publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj3esh+8vIdSIb44d0yGB
WDwOgQDAUqbZbSUkS7ho9OP3ptopmqw20Bc37RfKAqEjqY88kzl011BWw/MB/u0w
5f5ps8VH/lqFE/WeUWbuYZGi7w5dcGrUmiDYOPyz4B7GlYFUwkkiaduIFIRwO36/
+Vw9oC4cXpyxjJfFgVWLyhvCwuTOSy8E+LgZVNreIGeK0x1Cg3H3n2tR9I/ZmdWp
oVqQS3w7AxcSwz8g+KekLEVwFjuoWEu2z0KHrgLoyI4ksDJI6pCI+PjhQydcLhST
vSJCSBe+qleaecxrLR3P8Xs5HLYu3Mc4Sssdu+/3bBbUKufnxaTX6Rkp+SfxwGyK
rwIDAQAB
-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCPd6yH7y8h1Ihv
jh3TIYFYPA6BAMBSptltJSRLuGj04/em2imarDbQFzftF8oCoSOpjzyTOXTXUFbD
8wH+7TDl/mmzxUf+WoUT9Z5RZu5hkaLvDl1watSaINg4/LPgHsaVgVTCSSJp24gU
hHA7fr/5XD2gLhxenLGMl8WBVYvKG8LC5M5LLwT4uBlU2t4gZ4rTHUKDcfefa1H0
j9mZ1amhWpBLfDsDFxLDPyD4p6QsRXAWO6hYS7bPQoeuAujIjiSwMkjqkIj4+OFD
J1wuFJO9IkJIF76qV5p5zGstHc/xezkcti7cxzhKyx277/dsFtQq5+fFpNfpGSn5
J/HAbIqvAgMBAAECggEASEcZY65rh1akmdb2TZzOph4zjGhNfBZU6bjRjVhNgDqt
VKEKXsMuJi3cXhUjD6oQ5makNOO4apUt8TAnLEBg5y4CILBeMdV2v/R5GzeJFxyh
AmCxUGZxz2iGpkchc+LtVvq+MddYgA46g2Opiz+zBbSj02QHpN66UENSHHN1po8K
y9yNcXBxta3fwRS0g/ARLxbGnkKBhOxraV6UwOcjRFDAO6aC25KyP59JAM0SxmnO
G1sIDwiYz8lfM1D5ydffWAKGCU7ZBkrVDM4yumSpqEwCMTTcnEjTbQ8ZDYSz1vZZ
haVGzcgUrPtB9SGOgt9GbVrr0CMrSkEH9QVoPuVlGQKBgQDqYk+N92CZZ22pQ8te
kz1wyyqcJWrltMHKMLxzbDFzcJoL219XmGAcPG7fk4Qc6zq8E0f/+dfrbNyCUBEf
Zxal0t70QJWhCTxdQnLCTqLn1sdMr5POkVjEnF04kwacqolmNVC50H6sW2ilzzQn
CzjwoTzfGWoyLWU5YZXCfXXEXQKBgQCcst57Qyz/Sa6SaFjHzVQeDc9TqtVo9niu
H6DUTnCgM57mvBeYsedet359NJ3ET0vQT5RRAkPRBqgezxNb3OAa/dhV1glvArHr
7UPsAH6Yp98taYFHomqivR8CXq9AxV2EcAwIHBYJR21U6g/7XGUEExz2tQ+AzrBd
IFVo9CDaewKBgAMLIcNTKgLz792ZzsM8oDidusDqT3gKH9YTSe8pwX6hQK7Uu2k0
xlK3ii0HClkhyNJ2YaH2SZJ6CGb8ySwiN44Rrel4CTldGFaRrVHOmZjvFglt4jp1
crSi3ycD6bsRD9Wu7YxsI6jzSumURjYXlDazsUmoV9Os+TqEhOBQpr3VAoGAHBRx
ieUfyx+JCPNp9WP2DuyqmnOiioygU5OXXnQv+oVFlFNgZxx6OZ7oK8eh/eu3yjx4
d4vQW0S2G88/yNZr0mpqufcA+cOh3oVGBqSQCwsKEzk00YFpWoBJbkNJZHH5sCHk
BhACYudJ0E2hT4nfEDvclNkdThe7wvRoWcZlnMECgYBDSLnDeyduLhvctgcJUU9F
QdqFYAWjzXFfJItUGWAGFC7Lpn8PVcc7u6hH1oFJlohi39T2gYrKB5PmYN9/52/r
u8ThbAvTm+yqMmsDNkBkohfx25p3NLsV0r46mpRXuraQTFXcYrc1mW+BkoteY06S
Oe6lSHTplzRc0QPTat5+mQ==
-----END PRIVATE KEY-----`
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
      this.loadings.configBtn = true
      this.$socket.emit('handshake', { publicKey: this.client.publicKey })
    },
    hashReq () {
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

    },
    basicAuthenticate () {
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
    },
    passwordlessAuthenticate () {},
    register () {
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

</style>
