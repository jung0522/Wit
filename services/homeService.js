import express from "express";



import { getAllNotices } from "../models/noticeDao.js";
import { getPopularProductsByCategory,getALLProductByALLCategory,getNyamRecommendByUser } from '../models/productDao.js';

export const getHome = async (count) => {
    try {
       console.log("asdasdasd")
       console.log(count)
       
       
        //get userId logic
        //get products By userId
        //get  notice
       
        //유저 정보 가져오는 로직 추가해애함.
       const userId = 37;

       
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
            recommendations: nyamProductsResponse,
            popularProducts: PopularProductsResponse,
            nyamRecommendations: nyamProductsResponse,
            notices: noticeResponse
            
        };

    } catch (error) {
        console.error('Failed to update home', error);

    }

}

export const getProductByCategoryID = async (category,count) => {
    try {
       console.log("asdasdasd")
       console.log(category,count)
       
       
        //get userId logic
        //get products By userId
        //get  notice
       
        //유저 정보 가져오는 로직 추가해애함.
       const userId = 37;

       // 카테고리별 인기 상품 가져오기
       const PopularProductsResponse = await getPopularProductsByCategory(category,count);

       // 공지사항 가져오기
       const noticeResponse = await getAllNotices();
        // 메인 홈 응답 구성
        return { 
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

export const getNyamRecommend = async(count)=>{
    try{
        //유저 정보 가져오는 로직 추가해애함.
       const userId = 37;

       // 냠냠  인기 상품 가져오기
       const nyamProductsResponse = await getNyamRecommendByUser(count);

        // 메인 홈 응답 구성
        return { 
            nyamRecommendations: nyamProductsResponse,            
        };

    }catch{

    }
}

export const getRecommend = async(count)=>{
    try{
        //유저 정보 가져오는 로직 추가해애함.
       const userId = 37;

       // 냠냠  인기 상품 가져오기
       const nyamProductsResponse = await getNyamRecommendByUser(count);

        // 메인 홈 응답 구성
        return { 
            recommendations: nyamProductsResponse,            
        };

    }catch{

    }
}