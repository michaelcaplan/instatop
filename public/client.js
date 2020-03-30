// client-side js
// run by the browser each time your view template referencing it is loaded

const app = new Vue({
  el: '#app',
  data: {
    account: '',
    loading: false,
    posts: []
  },
  methods: {
    processAccount: function () {
      this.loading = true;
      
      let url = new URL("/process", window.location);
      url.searchParams.append('username', this.account);
      
      fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        this.loading = false;
        this.posts = data.posts;
      });
    },
    nl2br: function (str) {
      var breakTag = '<br>';
      var replaceStr = '$1'+ breakTag;
      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr);
    }
  }
});