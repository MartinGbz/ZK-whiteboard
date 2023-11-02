"use client";

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
import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from "react";

interface ContextProps {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoging: boolean;
  setIsLoging: Dispatch<SetStateAction<boolean>>;
  login: () => Promise<void>;
  logout: () => void;
}

const LoginContext = createContext<ContextProps>({
  user: null,
  setUser: (): User | null => null,
  isLoging: true,
  setIsLoging: (): boolean => false,
  login: async (): Promise<void> => {},
  logout: (): void => {},
});

export const GlobalContextProvider = ({ children }) => {
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

  return (
    <LoginContext.Provider
      value={{ user, setUser, isLoging, setIsLoging, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLoginContext = () => useContext(LoginContext);
