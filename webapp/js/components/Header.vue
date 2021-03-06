<template>
<div id="header">
    <a :href="homeUrl" class="logo"><img style="width: 140px;" src="/images/banner.svg" alt="DroneDB"></a>
    
    <a class="ui orange label alert" @click="showDisclaimer = !showDisclaimer"><i class="icon warning"></i> This is a test hub</a>
    <Alert v-if="showDisclaimer" @onClose="showDisclaimer = false" title="This is a Test Hub">
        <ul>
            <li>We will not guarantee data retention! Your data might be removed without notice.</li>
            <li>Do not store sensitive data, as there could be bugs.</li>
            <li>Features are still missing! This is a chance for you to <a href="https://dronedb.app/contact">let us know what you'd like to see added next</a> :)</li>
        </ul>
    </Alert>

    <div class="right">
        <a :href="downloadUrl"
            @click="handleDownload"
            v-if="showDownload"
            title="Download"
            class="ui button primary download">
                <i class="icon download"></i> {{ downloadLabel }}
        </a>
        <button v-if="!loggedIn" class="ui button primary" @click="login"><i class="icon lock"></i> Sign In</button>
        <div v-else class="circular ui icon top right pointing dropdown button user-menu" 
            @click.stop="toggleMenu"
            :title="username">
            <i class="icon user"></i>
            <div class="menu" ref="menu">
                <div class="header">{{ username }} </div>
                <div class="item" @click="logout" >Logout</div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { utils } from 'ddb';
import mouse from 'commonui/mouse';
import reg from '../libs/sharedRegistry';
import Alert from 'commonui/components/Alert';

export default {
  components: {
      Alert
  },
  data: function(){
      return {
          username: reg.getUsername(),
          loggedIn: reg.isLoggedIn(),
          params: this.$route.params,
          showDownload: !!this.$route.params.ds,
          selectedFiles: [],

          showDisclaimer: false
      }
  },
  computed: {
      homeUrl: function(){
          if (this.loggedIn){
              return `/r/${this.username}`;
          }else return "/";
      },

      downloadUrl: function(){
        const { org, ds } = this.params;
        if (org && ds){
            const dataset = reg.Organization(org).Dataset(ds);

            if (this.selectedFiles.length > 0){
                const dUrl = dataset.downloadUrl(this.selectedFiles.map(f => {
                    const { path } = utils.parseUri(f.path);
                    return path;
                }));

                // Browser limit
                if (dUrl.length < 2000) return dUrl;

                // We'll use a POST request
                else return "javascript:void(0)";
            }else{
                return dataset.downloadUrl();
            }
        }
      },

      downloadLabel: function(){
          if (this.selectedFiles.length > 0){
              return `${this.selectedFiles.length}`;
          }else{
              return "Download";
          }
      }
  },
  mounted: function(){
      mouse.on('click', this.hideMenu);

      reg.addEventListener('login', this.onRegLogin);
      reg.addEventListener('logout', this.onRegLogout);
  },
  watch: {
      $route: function(to, from){
          const { params } = to;
          
          // TODO: we might need have more complex 
          // logic in the future to see who has access
          // to download files?
          this.showDownload = !!params.ds; 
          this.params = params;
      }
  },
  beforeDestroy: function(){
      reg.removeEventListener('login', this.onRegLogin);
      reg.removeEventListener('logout', this.onRegLogout);

      mouse.off('click', this.hideMenu);
  },
  methods: {
      handleDownload: async function(e){
          if (this.downloadUrl === "javascript:void(0)"){
              const { org, ds } = this.params;
              const dataset = reg.Organization(org).Dataset(ds);

              const { downloadUrl, error } = await dataset.download(this.selectedFiles.map(f => {
                    const { path } = utils.parseUri(f.path);
                    return path;
              }));

              if (error){
                  // TODO: better error message?
                  alert(error);
              }else{
                  location.href = downloadUrl;
              }
          }else{
              // href will handle it
          }
      },

      onRegLogin: function(username){
          this.username = username;
          this.loggedIn = true;
      },
      
      onRegLogout: function(){
          this.username = "";
          this.loggedIn = false;
      },

      logout: function(){
          reg.logout();
          this.login();
      },

      login: function(){
          this.$router.push({name: "Login"}).catch(()=>{});
      },

      toggleMenu: function(){
          if (this.$refs.menu) this.$refs.menu.style.display = this.$refs.menu.style.display === 'block' ? 
                                          'none' : 
                                          'block';
      },

      hideMenu: function(){
          if (this.$refs.menu) this.$refs.menu.style.display = 'none';
      }
  }
}
</script>

<style scoped>
.alert{
    height: 26px;
    position: relative;
    top: 3px;
    margin-left: 8px;
}
#header{
    margin: 0;
    padding: 8px;
    padding-top: 12px;
    width: 100%;
    box-shadow: 0px 2px 4px -2px #000000;
    display: flex;
    .logo{
        margin-top: 4px;
    }
    .right{
        margin-left: auto;
    }
    .user-menu{
        margin-left: 8px;
    }
    .button.download{
        min-width: 140px;
    }
}
</style>