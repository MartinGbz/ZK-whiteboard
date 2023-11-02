import {
  ZKWHITEBOARD_VAULTID_VARNAME,
  sismoConnectConfig,
} from "@/configs/configs";
import { User } from "@/types/whiteboard-types";
import {
  AuthType,
  SismoConnect,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useLogin(): [User | null, boolean, () => void, () => void] {
  const [user, setUser] = useState<User | null>(null);
  const [isLoging, setIsLoging] = useState<boolean>(true);
  const login = async () => {
    startloginWithSismo();
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem(ZKWHITEBOARD_VAULTID_VARNAME);
    console.log("logout");
  };

  useEffect(() => {
    console.log("@@user", user);
  }, [user]);

  const router = useRouter();
  const pathname = usePathname();

  const sismoConnect = SismoConnect({
    config: {
      appId: sismoConnectConfig.appId,
    },
  });

  const [sismoConnectResponseMessage, setSismoConnectResponseMessage] =
    useState<SismoConnectResponse | null>(null);

  useEffect(() => {
    async function getUser() {
      const storagedVaultId = localStorage.getItem(
        ZKWHITEBOARD_VAULTID_VARNAME
      );
      if (storagedVaultId) {
        const response = await fetch("/api/user", {
          method: "POST",
          body: JSON.stringify(storagedVaultId),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        const user = res.user;
        setUser(user);
      }
      setIsLoging(false);
    }
    getUser();
  }, []);

  function startloginWithSismo() {
    setIsLoging(true);
    if (!sismoConnect) {
      console.error("Error with sismoConnect");
      setIsLoging(false);
      return;
    }
    sismoConnect.request({
      namespace: "main",
      auth: { authType: AuthType.VAULT },
    });
  }

  useEffect(() => {
    if (!sismoConnect) {
      setIsLoging(false);
      return;
    }
    const responseMessage: SismoConnectResponse | null =
      sismoConnect.getResponse();

    if (responseMessage) {
      setSismoConnectResponseMessage(responseMessage);
    }
  }, []);

  useEffect(() => {
    if (!sismoConnectResponseMessage) return;
    endLoginWithSismo(sismoConnectResponseMessage);
  }, [sismoConnectResponseMessage]);

  async function endLoginWithSismo(sismoConnectResponse: SismoConnectResponse) {
    if (
      sismoConnectResponse.appId === sismoConnectConfig.appId &&
      !sismoConnectResponse.signedMessage
    ) {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(sismoConnectResponse),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      const user: User = res.user;
      setUser(user);
      localStorage.setItem(ZKWHITEBOARD_VAULTID_VARNAME, user.vaultId);
      router.push(pathname);
    }
    setIsLoging(false);
  }

  return [user, isLoging, login, logout];
}
