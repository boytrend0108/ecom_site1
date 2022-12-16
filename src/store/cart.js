import axios from "axios";
export default {
  state:{
    userCart: [],// this is our cart
    totalCartPrice: 0,
    totalItems: 0,
    slideCart: "", // this change classes for cart animation
    showCart: false,
  },
  getters:{
    SHOW_CART(state){
      return state.showCart;
    },
    SLIDE_CART(state){
      return state.slideCart
    },
    USER_CART(state){
      return state.userCart;
    },
    TOTAL_CART_PRICE(state){
      return state.totalCartPrice;
    },
    TOTAL_CART_ITEMS(state){
      return state.totalItems
    },
  },
  actions:{
    GET_USER_CART({ commit }) {
      return axios.get('http://localhost:3000/userCart')
        .then((cart) => {
          commit("SET_USER_CART", cart.data)
        })
        .catch((err) => { console.log(err) })
    },
    SWITCH_SHOW_CART({commit}){
      commit('SET_SHOW_CART')
    },
    GET_HIDE_CART({commit}){
      commit('SET_HIDE_CART')
    },
    ADD_TO_CART({commit,state},item){
      const find = state.userCart.find((el)=> el.id === item.id)
      if(find){
        axios.get(`http://localhost:3000/userCart/`+item.id)
        .then((res)=> {
          res.data.quantity +=1;
          return res
        })
        .then((item)=>{
           return axios.put(`http://localhost:3000/userCart/`+item.data.id, item.data)
        })
        .then((item)=>{
          commit('CHANGE_QUANTITY_OF_ITEMS',item.data)
          commit('ADD_TO_CART_M')
        })
        .catch((err) => {
          console.log(err)
        }
        )
      }else{
        item.quantity = 1;
        item.totalPrice = item.itemPrice * item.quantity
        axios.post('http://localhost:3000/userCart', item)
        .then((item) => {
          commit("ADD_NEW_ITEM_TO_CART", item.data)
          commit('ADD_TO_CART_M')
        })
        .catch((err) => {
          console.log(err)
        })
      }
     
    },
    DELETE_ITEM({commit,state},id){
      axios.get(`http://localhost:3000/userCart/`+ id)
      .then((item)=>{
        if (item.data.quantity === 1 ){
          axios.delete(`http://localhost:3000/userCart/`+ id)
        }else{
          item.data.quantity -= 1;
          axios.put(`http://localhost:3000/userCart/`+ id, item.data)
        }
        const findEl = state.userCart.find(el => el.id === id)
        if (findEl.quantity === 1) {
          const index = state.userCart.findIndex(el => el.id === id)
          state.userCart.splice(index, 1)
          const b = JSON.stringify(state.userCart, null, 4)
          localStorage.setItem('cart', b);
          console.log(state.userCart.length)
          if (state.userCart.length === 0) {
           commit('SET_BTN_DISABLED')      
          }
        } else {
          findEl.quantity -= 1;
          const b = JSON.stringify(state.userCart, null, 4)
          localStorage.setItem('cart', b)
        }
        commit('SET_DELETE_ITEM',id)
      }) 
    },
    CLEAR_CART({ commit }) {
      return axios.get(`http://localhost:3000/userCart`)
        .then((cart) => {
          for (let el of cart.data) {
            axios.delete(`http://localhost:3000/userCart/`+ el.id)
          }})
        .then(() => {   
          commit('SET_CLEAR_CART')
        })
    },
    A_POST_USER_CART_TO_LOCALSTORAGE({commit}){
      commit('M_POST_USER_CART_TO_LOCALSTORAGE') 
     },
  },
  mutations:{
    SET_USER_CART(state, cart) {
      state.userCart = cart;
      state.totalCartPrice = state.userCart.reduce((acc, { totalPrice }) =>
        acc + totalPrice, 0);
      state.totalItems = state.userCart.reduce((acc, { quantity }) =>
        acc + quantity, 0);
    },
    ADD_NEW_ITEM_TO_CART(state, item) {
      state.userCart.push(item);
      const b = JSON.stringify(state.userCart, null, 4)
      localStorage.setItem('cart', b)
      if (state.userCart.length > 0) { state.showBtn = true }
    },
    CHANGE_QUANTITY_OF_ITEMS(state, item) {
      const index = state.userCart.findIndex(el => el.id === item.id)
      state.userCart[index].quantity += 1;
      state.userCart[index].totalPrice =
        state.userCart[index].quantity * state.userCart[index].itemPrice
      const b = JSON.stringify(state.userCart, null, 4)
      localStorage.setItem('cart', b)
      if (state.userCart.length > 0) { state.showBtn = true }
    },
    SET_SHOW_CART(state){
      if(state.pagePath === '/cart'){
        return
      }else{
        state.showCart = !state.showCart
        if (state.showCart === true) {
          document.querySelector(".menu").style.display = "none";
          state.showMenu = false;
          document.querySelector(".cart-box").style.display = "block";
          state.slideCart = "slide-left"
        } else {
          state.slideCart = "slide-out-top"
        }  
      }
        
    },
    SET_HIDE_CART(state){
      state.slideCart = "slide-out-top"
      // document.querySelector(".cart-box").style.display = "none";
    },
    ADD_TO_CART_M(state) {
      state.totalCartPrice = state.userCart.reduce((acc, { totalPrice }) =>
        acc + totalPrice, 0);
      state.totalItems = state.userCart.reduce((acc, { quantity }) =>
        acc + quantity, 0);
    },
    SET_DELETE_ITEM(state, id) {

      state.totalCartPrice = state.userCart.reduce((acc, { totalPrice }) =>
        acc + totalPrice, 0);
      state.totalItems = state.userCart.reduce((acc, { quantity }) =>
        acc + quantity, 0);
    },
    SET_CLEAR_CART(state) {
      state.userCart = [];
      state.totalCartPrice = 0;
      state.totalItems = 0;
      const b = JSON.stringify(state.userCart, null, 4)
      localStorage.setItem('cart', b)
    },
    M_POST_USER_CART_TO_LOCALSTORAGE(state) {
      const b = JSON.stringify(state.userCart, null, 4)
      localStorage.setItem('cart', b);
    },
  }
}