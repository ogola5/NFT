import { CryptoDevsDAOABI,CryptoDevsDAOAddress,CryptoDevsNFTABI,CryptoDevsNFTAddress, } from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { useEffect,useState } from "react";
import { formatEther } from "viem/utils";
import { useAccount,useBalance,useContractRead } from "wagmi";
import { readContract,waitForTransaction,writeContract } from "viem/dist/types/actions/public/readContract";
import styles from "../styles/Home.module.css";
import {Inter} from "next/font/google";

const inter = Inter({
  subsets:["latin"],
  display:"swap",
});
export default function Home(){
  //check if the user's wallet is connected andf it's address Wagmi's hooks.
  const {address,isConnected} = useAccount();
  //State VAriable to know if the component has been mounted yet or not
  const [isMounted,setIsMointed]= useState(false);
  //AFke NFT tokaen Id to purchase.Used when creating a proposal.
  const[fakeNftTokenId,setFakeNftTokenId]= useState("");
  //State variable to store all proposals in the DAO
  const[proposals,setProposals]= useState([]);
  //State variable to switch between the create proposal and view Proposal tabs
  const[selectedTab,setSelectedTab]= useState("");

  //Fetch the owner of the DAO
  const daoOwner = useContractRead({
    abi:CryptoDevsDAOABI,
    address:CryptoDevsDAOAddress,
    functionName:"owner",
  });
  //fetch the balance of the DAO
  const daoBalance = useBalance({
    address:CryptoDevsDAOAddress,
  });
  //fetch the number of proposals in the DAO
  const numOfProposalsInDAO = useContractRead({
    abi:CryptoDevsDAOABI,
    address:CryptoDevsDAOAddress,
    functionName:"numProposals",
  });
  //Fetch the CryptoDevs NFT balance of the user
  const nftBalanceOfUser  = useContractRead({
    abi:CryptoDevsNFTABI,
    addres:CryptoDevsNFTAddress,
    functionName:"balanceOf",
    args:[address],
  });
  //function to make a createProposal transcation in DAO
  async function createProposal(){
    setLoading(true);
    try{
      const tx = await writeContract({
        address: CryptoDevsDAOAddress,
        abi:CryptoDevsDAOABI,
        functionName:"createProposal",
        args:[fakeNftTokenId],
      });

      await waitForTransaction(tx);
    }catch(error){
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }
  // function to fetch a proposal by its ID
  async function fetchProposalById(id) {
    try{
      const proposal =await readContract({
        address:CryptoDevsDAOAddress,
        abi:CryptoDevsDAOABI,
        functionName:"proposals",
        args:[id],
      });
      const [nftTokenId,deadline,yayVotes,nayVotes,executed] = proposal;
      const parsedProposal = {
        proposalId:id,
        nftTokenId:nftTokenId.toString(),   deadline:new Date(parseInt(deadline,toString())*1000),
        yayVotes:yayVotes.toString(),
        nayVotes:nayVotes.toString(),
        executed:Boolean(executed),

      };
      return parsedProposal;
    }catch(error){
      console.error(error);
      window.alert(error);
    }
  }
  //fucntion to fetch all proposals in the DAO
  async function fetchAllProposals(){
    try{
      const proposals = [];
      for(let i=0;i<numOfProposalsInDAO.data; i++){
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }
      setProposals(proposals);
      return proposals;
    }catch(error){
      console.error(error);
      window.alert(error);
    }
  }
  //fucntion to vote YAY or NAY on a proposal
  async function voteForProposal(proposalId,vote){
    try{
      const tx = await writeContract({
        address:CryptoDevsDAOAddress,
        abi:CryptoDevsDAOABI,
        functionName:"voteOnProposal",
        args:[proposalId,vote =="YAY"? 0:1],
      });
      await waitForTransaction(tx);

    }catch(error){
      console.error(error);
      window.alert(error);

    }
    setLoading(false);
  }
  //Function to execute a proposal afetr deadline has been exceeded
  async function executeProposal(proposalId){
    setLoading(true);
    try{
      const tx  = await writeContract({
        address:CryptoDevsDAOAddress,
        abi:CryptoDevsDAOABI,
        functionName:"executeProposal",
        args:[proposalId],
      });
      await waitForTransaction(tx);

    }catch(error){
      console.error(error);
      window.alert(error);
    }
    setLoading(false)
  }
  //function to withdraw ether from the DAO
  async function withdrawDAOEther(){
    setLoading(true);
    try{
      const tx = await writeContract({
        address:CryptoDevsDAOAddress,
        abi:CryptoDevsDAOABI,
        functionName:"withdrawEther",
        args:[],
      });
      await  waitForTransaction(tx);
      
    }catch(error){
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
    
  }

}

