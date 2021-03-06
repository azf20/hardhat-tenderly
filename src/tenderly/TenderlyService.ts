import { PluginName, ReverseNetworkMap } from "../index";

import { TenderlyApiService } from "./TenderlyApiService";
import {
  ApiContract,
  ContractResponse,
  TenderlyContractUploadRequest
} from "./types";

export const TENDERLY_API_BASE_URL = "https://api.tenderly.co";
export const TENDERLY_DASHBOARD_BASE_URL = "https://dashboard.tenderly.co";

export class TenderlyService {
  public static async verifyContracts(request: TenderlyContractUploadRequest) {
    const tenderlyApi = TenderlyApiService.configureInstance();

    try {
      const response = await tenderlyApi.post(
        "/api/v1/account/me/verify-contracts",
        { ...request }
      );

      const responseData: ContractResponse = response.data;

      let contract: ApiContract;

      if (responseData.bytecode_mismatch_errors != null) {
        console.log(
          `Error in ${PluginName}: Bytecode mismatch detected. Contract verification failed`
        );
        return;
      }

      if (!responseData.contracts?.length) {
        console.log(`${PluginName}: No new contracts have been verified`);
        return;
      }

      console.log("Smart Contracts successfully verified");
      console.group();
      for (contract of responseData.contracts) {
        const contractLink = `${TENDERLY_DASHBOARD_BASE_URL}/contract/${
          ReverseNetworkMap[contract.network_id]
        }/${contract.address}`;
        console.log(
          `Contract ${contract.address} verified. You can view the contract at ${contractLink}`
        );
      }
      console.groupEnd();
    } catch (error) {
      console.log(
        `Error in ${PluginName}: There was an error during the request. Contract verification failed`
      );
    }
  }

  public static async pushContracts(
    request: TenderlyContractUploadRequest,
    tenderlyProject: string,
    username: string
  ) {
    const tenderlyApi = TenderlyApiService.configureInstance();

    try {
      const response = await tenderlyApi.post(
        `/api/v1/account/${username}/project/${tenderlyProject}/contracts`,
        { ...request }
      );

      const responseData: ContractResponse = response.data;

      if (responseData.bytecode_mismatch_errors != null) {
        console.log(
          `Error in ${PluginName}: Bytecode mismatch detected. Contract push failed`
        );
        return;
      }

      if (!responseData.contracts?.length) {
        console.log(`${PluginName}: No new contracts have been pushed`);
        return;
      }

      const dashLink = `${TENDERLY_DASHBOARD_BASE_URL}/${username}/${tenderlyProject}/contracts`;

      console.log(
        `Successfully pushed Smart Contracts for project ${tenderlyProject}. You can view your contracts at ${dashLink}`
      );
    } catch (error) {
      console.log(
        `Error in ${PluginName}: There was an error during the request. Contract push failed`
      );
    }
  }
}
