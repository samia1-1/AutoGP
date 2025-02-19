import Home from "@/pages/Home";
import Login from "@/pages/User/Login";
import Manage from "@/pages/DataManage";
import Register from "@/pages/User/Register";
import { Navigate, createBrowserRouter } from "react-router-dom";
import Personal from "@/pages/User/Personal";
import Analysis from "@/pages/Analysis";
import Select from "@/pages/Select";
import Communicate from "@/pages/Communicate";
import Train from "@/pages/Select/Components/Train";
import Predict from "@/pages/Select/Components/Predict";
import Combine from "@/pages/Select/Components/Combine";
import Optimal from "@/pages/Select/Components/Optimal";

import { RequireAuth } from "@/utils";
import Sharedata from "@/pages/DataManage/Components/Sharedata";
import Highquality from "@/pages/DataManage/Components/Highquality";
import Personaldata from "@/pages/DataManage/Components/Personaldata";
import PhenotypeData from "@/pages/DataManage/Components/PhenotypeData";
import LoginEmail from "@/pages/User/LoginEmail";
import Phenotype from "@/pages/Analysis/Components/Phenotype";
import Pretreatment from "@/pages/Pretreatment";
import PrePhenotype from "@/pages/Pretreatment/Components/Phenotype";
// import AAAOBJ from "@/pages/AAAOBJ";
import PreGene from "@/pages/Pretreatment/Components/Gene";
import AnalGWAS from "@/pages/Analysis/Components/GWAS";
import AnalGroup from "@/pages/Analysis/Components/Group";
import App from "@/App";


export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // element: <Navigate to="/home" />
    children: [
      {
        index: true,  // 设置默认子路由
        element: <Navigate to="home" replace />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'manage',
        element: <RequireAuth><Manage /></RequireAuth>,
        // element: <Manage />,
        children: [
          {
            path: 'sharedata',
            element: <Sharedata />
          },
          {
            path: 'highquality',
            element: <Highquality />
          },
          {
            path: 'personaldata',
            element: <Personaldata dataKey="data" />
          },
          {
            path: "phenotype",
            element: <PhenotypeData />
          }
        ]
      },
      {
        path: 'pretreatment',
        // element:<Pretreatment />,
        element: <RequireAuth><Pretreatment /></RequireAuth>,
        children: [
          {
            path: 'phenotype_extraction',
            element: <PrePhenotype />
            // element:<AAAOBJ />
          },
          {
            path: 'gene_extraction',
            element: <PreGene />
          },
        ]
      },
      {
        path: 'select',
        // element: <Select />,
        element: <RequireAuth><Select /></RequireAuth>,
        children: [
          {
            index: true,
            element: <Navigate to="train" replace />
          },
          {
            path: 'train',
            element: <Train />
          },
          {
            path: 'predict',
            element: <Predict />
          },
          {
            path: 'combine',
            element: <Combine />
          },
          {
            path: 'optimal',
            element: <Optimal />
          }
        ]
      },
      {
        path: 'analysis',
        // element: <Analysis />,
        element: <RequireAuth><Analysis /></RequireAuth>,
        children: [
          {
            path: 'phenotype',
            element: <Phenotype />
          },
          {
            path: 'GWAS',
            element: <AnalGWAS />
          },
          {
            path: 'group',
            element: <AnalGroup />
          }
        ]
      },
      {
        path: 'communicate',
        // element: <RequireAuth><Communicate /></RequireAuth>
        element: <Communicate />
      },
      {
        path: 'personal',
        element: <RequireAuth><Personal /></RequireAuth>
        // element: <Personal />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/email_login',
    element: <LoginEmail />
  },
  {
    path: '/register',
    element: <Register />
  },
]);