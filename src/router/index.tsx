import React, { Suspense } from 'react';
import { Navigate, createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "@/utils";
import SingleAreaTrain from '@/pages/Select/Components/Train/SingleAreaTrain';
import MulitAreaTrain from '@/pages/Select/Components/Train/MulitAreaTrain';
import SingleAreaPredict from '@/pages/Select/Components/Predict/SingleAreaPredict';
import MulitAreaPredict from '@/pages/Select/Components/Predict/MulitAreaPredict';
import SingleAreaCombine from '@/pages/Select/Components/Combine/SingleAreaCombine';
import MulitAreaCombine from '@/pages/Select/Components/Combine/MulitAreaCombine';
import TrainOptimal from '@/pages/Select/Components/TrainOptimal';
import Cimp from '@/pages/CornManagementPlatform';
import ChinaMap from '@/pages/CornManagementPlatform/components/ChinaMap';

// 使用 React.lazy 实现懒加载
const Init = React.lazy(() => import('@/pages/Init'));
const Home = React.lazy(() => import('@/pages/Home'));
const Login = React.lazy(() => import('@/pages/User/Login'));
const Manage = React.lazy(() => import('@/pages/DataManage'));
const Register = React.lazy(() => import('@/pages/User/Register'));
const Personal = React.lazy(() => import('@/pages/User/Personal'));
const Analysis = React.lazy(() => import('@/pages/Analysis'));
const Select = React.lazy(() => import('@/pages/Select'));
const Communicate = React.lazy(() => import('@/pages/Communicate'));
const Train = React.lazy(() => import('@/pages/Select/Components/Train'));
const Predict = React.lazy(() => import('@/pages/Select/Components/Predict'));
const Combine = React.lazy(() => import('@/pages/Select/Components/Combine'));
const Optimal = React.lazy(() => import('@/pages/Select/Components/Optimal'));
const Sharedata = React.lazy(() => import('@/pages/DataManage/Components/Sharedata'));
const Highquality = React.lazy(() => import('@/pages/DataManage/Components/Highquality'));
const Personaldata = React.lazy(() => import('@/pages/DataManage/Components/Personaldata'));
const PhenotypeData = React.lazy(() => import('@/pages/DataManage/Components/PhenotypeData'));
const LoginEmail = React.lazy(() => import('@/pages/User/LoginEmail'));
const Phenotype = React.lazy(() => import('@/pages/Analysis/Components/Phenotype'));
const Pretreatment = React.lazy(() => import('@/pages/Pretreatment'));
const PrePhenotype = React.lazy(() => import('@/pages/Pretreatment/Components/Phenotype/index'));
const PreGene = React.lazy(() => import('@/pages/Pretreatment/Components/Gene'));
const AnalGWAS = React.lazy(() => import('@/pages/Analysis/Components/GWAS'));
const AnalGroup = React.lazy(() => import('@/pages/Analysis/Components/Group'));
const App = React.lazy(() => import('@/App'));
const RouteLoading = React.lazy(() => import("@/components/RouteLoading"))
const NotFound = React.lazy(() => import("@/components/NotFound"))
const ProvinceDetail = React.lazy(() => import('@/pages/CornManagementPlatform/components/ProvinceDetail'));  // 添加 ProvinceDetail 的懒加载
const PlyDetail = React.lazy(() => import('@/pages/CornManagementPlatform/components/PlyDetail'));  // 添加 PlyDetail 的懒加载

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <Init />
      </Suspense>
    )
  },
  {
    path: '/app',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        index: true,  // 设置默认子路由
        element: <Navigate to="home" replace />
      },
      {
        path: 'home',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'manage',
        element: (
          <RequireAuth>
            <Suspense fallback={<RouteLoading />}>
              <Manage />
            </Suspense>
          </RequireAuth>
        ),
        children: [
          {
            path: 'sharedata',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Sharedata />
              </Suspense>
            )
          },
          {
            path: 'highquality',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Highquality />
              </Suspense>
            )
          },
          {
            path: 'personaldata',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Personaldata dataKey="data" />
              </Suspense>
            )
          },
          {
            path: "phenotype",
            element: (
              <Suspense fallback={<RouteLoading />}>
                <PhenotypeData />
              </Suspense>
            )
          }
        ]
      },
      {
        path: 'pretreatment',
        element: (
          <RequireAuth>
            <Suspense fallback={<RouteLoading />}>
              <Pretreatment />
            </Suspense>
          </RequireAuth>
        ),
        children: [
          {
            path: 'phenotype_extraction',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <PrePhenotype />
              </Suspense>
            )
          },
          {
            path: 'gene_extraction',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <PreGene />
              </Suspense>
            )
          },
        ]
      },
      {
        path: 'select',
        element: (
          <RequireAuth>
            <Suspense fallback={<RouteLoading />}>
              <Select />
            </Suspense>
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="train" replace />
          },
          {
            path: 'train',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Train />
              </Suspense>
            ),
            children: [
              {
                index: true,  // 设置默认子路由
                element: <Navigate to="single_area" replace />
              },
              {
                path: "single_area",
                element: <SingleAreaTrain />
              },
              {
                path: "mulit_area",
                element: <MulitAreaTrain />
              }
            ]
          },
          {
            path: 'predict',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Predict />
              </Suspense>
            ),
            children: [
              {
                index: true,  // 设置默认子路由
                element: <Navigate to="single_area" replace />
              },
              {
                path: "single_area",
                element: <SingleAreaPredict />
              },
              {
                path: "mulit_area",
                element: <MulitAreaPredict />
              }
            ]
          },
          {
            path: 'combine',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Combine />
              </Suspense>
            ),
            children: [
              {
                index: true,  // 设置默认子路由
                element: <Navigate to="single_area" replace />
              },
              {
                path: "single_area",
                element: <SingleAreaCombine />
              },
              {
                path: "mulit_area",
                element: <MulitAreaCombine />
              }
            ]
          },
          {
            path: 'optimal',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Optimal />
              </Suspense>
            )
          },
          {
            path: 'train_optimal',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <TrainOptimal />
              </Suspense>
            )
          }
        ]
      },
      {
        path: 'analysis',
        element: (
          <RequireAuth>
            <Suspense fallback={<RouteLoading />}>
              <Analysis />
            </Suspense>
          </RequireAuth>
        ),
        children: [
          {
            path: 'phenotype',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <Phenotype />
              </Suspense>
            )
          },
          {
            path: 'GWAS',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <AnalGWAS />
              </Suspense>
            )
          },
          {
            path: 'group',
            element: (
              <Suspense fallback={<RouteLoading />}>
                <AnalGroup />
              </Suspense>
            )
          }
        ]
      },
      {
        path: 'communicate',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <Communicate />
          </Suspense>
        )
      },
      {
        path: 'personal',
        element: (
          <RequireAuth>
            <Suspense fallback={<RouteLoading />}>
              <Personal />
            </Suspense>
          </RequireAuth>
        )
      }
    ]
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/email_login',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <LoginEmail />
      </Suspense>
    )
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <Register />
      </Suspense>
    )
  },
  {
    path: '/cimp',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <Cimp />
      </Suspense>
    ),
    children: [
      {
        index: true,  // 设置默认子路由
        element: <Navigate to="china_map" replace />
      },
      {
        path: 'china_map',
        element: (
          <Suspense fallback={<RouteLoading />}>
            <ChinaMap />
          </Suspense>
        )
      },
      {
        path: 'province_detail',
        element: (
          <RequireAuth>
            <Suspense fallback={<RouteLoading />}>
              <ProvinceDetail />
            </Suspense>
          </RequireAuth>
        )
      },
    ]
  },
  {
    path: `/cimp/ply_detail`,
    element: (
      <Suspense fallback={<RouteLoading />}>
        <PlyDetail />
      </Suspense>
    )
  },
  {
    path: '*',  // 添加 404 页面
    element: (
      <Suspense fallback={<RouteLoading />}>
        <NotFound />
      </Suspense>
    )
  }
]);
