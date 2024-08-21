import express from "express";



import { getAllNotices } from "../models/noticeDao.js";
import { getPopularProductsByCategory,getALLProductByALLCategory,getNyamRecommendByUser } from '../models/productDao.js';
import {getOneUser} from '../models/userDao.js';

export const getHome = async (count,userId) => {
    try {
       console.log("asdasdasd")
       console.log(count)
       
       
        //get userId logic
        //get products By userId
        //get  notice
       


       // 카테고리별 인기 상품 가져오기
       const userInfo = await getOneUser(userId);
       
       // 유저에 대한 추천 상품 가져오기
       const RecommendForUserResponse = await getCustomProductsByUserId(userId);

       // 카테고리별 인기 상품 가져오기
       const PopularProductsResponse = await getALLProductByALLCategory(count);

       // 식품 추천 상품 가져오기
       const nyamProductsResponse = await getNyamRecommendByUser(count);

       // 공지사항 가져오기
       const noticeResponse = await getAllNotices();
        // 메인 홈 응답 구성
        return { 
                // recommendations: RecommendForUserResponse,
                // popularProducts: PopularProductsResponse,
                // nyamRecommendations: NyamRecommendProductsResponse,
                // notices: noticeResponse
            user : userInfo,
            recommendations: nyamProductsResponse,
            popularProducts: PopularProductsResponse,
            nyamRecommendations: nyamProductsResponse,
            notices: noticeResponse
            
        };

    } catch (error) {
        console.error('Failed to update home', error);

    }

}

export const getProductByCategoryID = async (category,count,userId) => {
    try {
       console.log("asdasdasd")
       console.log(category,count)
       
       
        //get userId logic
        //get products By userId
        //get  notice
       


       // 카테고리별 인기 상품 가져오기
       const userInfo = await getOneUser(userId);
       const PopularProductsResponse = await getPopularProductsByCategory(category,count);

        // 메인 홈 응답 구성
        return {
                user : userInfo,
                popularProducts: PopularProductsResponse,            
        };

    } catch (error) {
        console.error('Failed to update home', error);

    }

}




const getCustomProductsByUserId = async(userId) =>{
    try {
        
    } catch (error) {
        
    }

}

export const getNyamRecommend = async(count,userId)=>{
    try{
           

        console.log(userId)
           // 카테고리별 인기 상품 가져오기
           const userInfo = await getOneUser(userId);
           console.log(userInfo)
        // 냠냠  인기 상품 가져오기
       const nyamProductsResponse = await getNyamRecommendByUser(count);

        // 메인 홈 응답 구성
        return { 
            user : userInfo,

            nyamRecommendations: nyamProductsResponse,            
        };

    }catch{

    }
}

export const getRecommend = async(count,userId)=>{
    try{

        console.log(userId)
       // 카테고리별 인기 상품 가져오기
       const userInfo = await getOneUser(userId);
       // 냠냠  인기 상품 가져오기
       const nyamProductsResponse = await getNyamRecommendByUser(count);
        
        // 메인 홈 응답 구성
        return { 
            user : userInfo,
            recommendations: nyamProductsResponse,            
        };

    }catch{

    }
}