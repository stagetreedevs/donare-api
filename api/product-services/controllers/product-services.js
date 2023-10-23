'use strict';

const Fuse = require('fuse.js')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const products = await strapi.query('product-services').find({
      status: "in_progress",
    });
    return products.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });;
  },

  async getAll(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    const { latitude, longitude } = ctx.request.query;

    // calcule distance between user and product in km
    const distanceBetweenUserAndProduct = (lat1, lon1, lat2, lon2) => {

      lat1 = parseFloat(lat1);
      lon1 = parseFloat(lon1);
      lat2 = parseFloat(lat2);
      lon2 = parseFloat(lon2);

      var R = 6371; // Radius of the earth in km
      let dLat = (lat2 - lat1) * Math.PI / 180;
      let dLon = (lon2 - lon1) * Math.PI / 180;
      let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c;
      return d;
    };

    const products = await strapi.query('product-services').find({
      status: "in_progress",
    });

    // calcular distancia entre o usuario e o produto e filtrar os produtos que estao proximos do usuario
    const productsFiltered = products.filter(product => {
      const distance = distanceBetweenUserAndProduct(latitude, longitude, product.latitude, product.longitude);
      // console.log(distance, "Distancia")
      return distance <= 100; // 100km
    });

    return productsFiltered.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  },

  async updateCancelled(ctx) {
    const { id } = ctx.params;

    const product = await strapi.query('product-services').findOne({ id });
    product.status = "cancelled";
    let entity = await strapi.services['product-services'].update({ id: id }, product);

    const donation_service = await strapi.query('donation').find({ product_service: id });
    donation_service.forEach(async donation => {
      donation.status = "rejected";
      await strapi.services['donation'].update({ id: donation.id }, donation);
    });

    return product || 'No products found';
  },

  async searchProducts(ctx) {
    const searchTerm = ctx.query._search;

    const { latitude, longitude } = ctx.request.query;

    // calcule distance between user and product in km
    const distanceBetweenUserAndProduct = (lat1, lon1, lat2, lon2) => {

      lat1 = parseFloat(lat1);
      lon1 = parseFloat(lon1);
      lat2 = parseFloat(lat2);
      lon2 = parseFloat(lon2);

      var R = 6371; // Radius of the earth in km
      let dLat = (lat2 - lat1) * Math.PI / 180;
      let dLon = (lon2 - lon1) * Math.PI / 180;
      let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c;
      return d;
    };

    const products = await strapi.query('product-services').find({
      status: "in_progress",
    });

    const productsFiltered = products.filter(product => {
      const distance = distanceBetweenUserAndProduct(latitude, longitude, product.latitude, product.longitude);
      // console.log(distance, "Distancia")
      return distance <= 100; // 100km
    });

    const fuse = new Fuse(productsFiltered, {
      keys:["name", "description", "category.name"]
    });

    const searchedProducts = fuse.search(searchTerm);

    return searchedProducts.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }
};
