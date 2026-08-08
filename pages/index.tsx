import Head from "next/head";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (
        event: string,
        handler: (...args: unknown[]) => void
      ) => void;
    };
  }
}

const ARC_TESTNET_CHAIN_ID = "0x4CEF52";

export default function Home() {
  const [account, setAccount] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    if (!window.ethereum) return;

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[];

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("Please install MetaMask or another compatible wallet.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Connecting wallet...");

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet account found.");
      }

      setAccount(accounts[0]);
      setConnected(true);
      setStatus("Wallet connected successfully.");
    } catch (error) {
      console.error(error);
      setStatus("Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  }

  async function switchToArc() {
    if (!window.ethereum) {
      setStatus("Compatible wallet not detected.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Switching to Arc Network...");

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: ARC_TESTNET_CHAIN_ID,
          },
        ],
      });

      setStatus("Arc Network selected.");
    } catch (error) {
      console.error(error);

      setStatus(
        "Arc Network could not be selected automatically. Please add/select Arc Network in your wallet."
      );
    } finally {
      setLoading(false);
    }
  }

  function disconnectWallet() {
    setAccount("");
    setConnected(false);
    setStatus("Wallet disconnected from this interface.");
  }

  return (
    <>
      <Head>
        <title>ArcSetu — USDC Settlement Engine</title>
        <meta
          name="description"
          content="ArcSetu — Programmable USDC settlement engine and cross-chain payment bridge on Arc Network."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </Head>

      <main className="app">
        <nav className="navbar">
          <div className="brand">
            <div className="brandIcon">A</div>

            <div>
              <div className="brandName">ArcSetu</div>
              <div className="brandSub">USDC Settlement Network</div>
            </div>
          </div>

          <div className="navActions">
            <a href="#dashboard">Dashboard</a>
            <a href="#features">Features</a>

            {!connected ? (
              <button
                className="connectButton"
                onClick={connectWallet}
                disabled={loading}
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <button className="walletButton" onClick={disconnectWallet}>
                {shortAddress}
              </button>
            )}
          </div>
        </nav>

        <section className="hero" id="dashboard">
          <div className="heroContent">
            <div className="badge">
              <span className="dot"></span>
              ARC NETWORK • USDC NATIVE
            </div>

            <h1>
              Move USDC.
              <br />
              <span>Settle Globally.</span>
            </h1>

            <p className="heroText">
              ArcSetu is a programmable USDC settlement engine designed to
              connect users, merchants and liquidity with secure blockchain
              infrastructure.
            </p>

            <div className="heroButtons">
              {!connected ? (
                <button
                  className="primaryButton"
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Connect Wallet →"}
                </button>
              ) : (
                <button
                  className="primaryButton"
                  onClick={switchToArc}
                  disabled={loading}
                >
                  {loading ? "Switching..." : "Use Arc Network →"}
                </button>
              )}

              <a className="secondaryButton" href="#features">
                Explore ArcSetu
              </a>
            </div>

            {status && <div className="statusBox">{status}</div>}
          </div>

          <div className="heroVisual">
            <div className="orb">
              <div className="orbInner">
                <div className="arcText">ARC</div>
                <div className="usdcText">USDC</div>
              </div>
            </div>

            <div className="floatingCard cardOne">
              <span>Network</span>
              <strong>Arc Testnet</strong>
            </div>

            <div className="floatingCard cardTwo">
              <span>Settlement</span>
              <strong>USDC</strong>
            </div>
          </div>
        </section>

        <section className="stats">
          <div>
            <span>NETWORK</span>
            <strong>Arc</strong>
          </div>

          <div>
            <span>SETTLEMENT TOKEN</span>
            <strong>USDC</strong>
          </div>

          <div>
            <span>CHAIN ID</span>
            <strong>5042002</strong>
          </div>

          <div>
            <span>STATUS</span>
            <strong className="live">
              <i></i> Active
            </strong>
          </div>
        </section>

        <section className="features" id="features">
          <div className="sectionHeading">
            <div className="badge">CORE INFRASTRUCTURE</div>

            <h2>One bridge. Multiple possibilities.</h2>

            <p>
              ArcSetu is designed as a modular settlement layer for modern
              USDC payments.
            </p>
          </div>

          <div className="featureGrid">
            <article className="featureCard">
              <div className="featureIcon">₮</div>
              <h3>USDC Settlement</h3>
              <p>
                Native USDC-focused settlement infrastructure for fast and
                transparent blockchain payments.
              </p>
            </article>

            <article className="featureCard">
              <div className="featureIcon">⇄</div>
              <h3>Cross-Chain Bridge</h3>
              <p>
                Designed to connect users and liquidity across supported
                blockchain networks.
              </p>
            </article>

            <article className="featureCard">
              <div className="featureIcon">◈</div>
              <h3>Programmable Payments</h3>
              <p>
                Build payment workflows that can be integrated with smart
                contracts and applications.
              </p>
            </article>

            <article className="featureCard">
              <div className="featureIcon">✓</div>
              <h3>Transparent Settlement</h3>
              <p>
                Blockchain-based transaction verification helps users track
                and verify settlement activity.
              </p>
            </article>
          </div>
        </section>

        <section className="workflow">
          <div className="workflowText">
            <div className="badge">HOW IT WORKS</div>

            <h2>From wallet to settlement.</h2>

            <p>
              ArcSetu provides a simple interface while the underlying
              blockchain infrastructure handles settlement.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <span>01</span>
              <div>
                <h3>Connect</h3>
                <p>Connect a compatible Web3 wallet.</p>
              </div>
            </div>

            <div className="step">
              <span>02</span>
              <div>
                <h3>Select Network</h3>
                <p>Use the supported Arc Network environment.</p>
              </div>
            </div>

            <div className="step">
              <span>03</span>
              <div>
                <h3>Settle</h3>
                <p>Execute USDC payment and settlement workflows.</p>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <div>
            <strong>ArcSetu</strong>
            <span>Programmable USDC Settlement Engine</span>
          </div>

          <div className="footerRight">
            Built for Arc Network
          </div>
        </footer>

        <style jsx>{`
          * {
            box-sizing: border-box;
          }

          .app {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 75% 20%,
                rgba(90, 100, 255, 0.16),
                transparent 28%
              ),
              radial-gradient(
                circle at 15% 60%,
                rgba(0, 220, 180, 0.1),
                transparent 25%
              ),
              #070912;
            color: #ffffff;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
            overflow: hidden;
          }

          .navbar {
            width: 100%;
            max-width: 1240px;
            margin: auto;
            padding: 22px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .brand {
            display: flex;
            gap: 12px;
            align-items: center;
          }

          .brandIcon {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 900;
            font-size: 20px;
            background: linear-gradient(135deg, #6c63ff, #00d9b5);
            box-shadow: 0 10px 35px rgba(75, 90, 255, 0.35);
          }

          .brandName {
            font-size: 18px;
            font-weight: 800;
          }

          .brandSub {
            color: #8990a5;
            font-size: 11px;
            margin-top: 2px;
          }

          .navActions {
            display: flex;
            align-items: center;
            gap: 25px;
          }

          .navActions a {
            color: #aeb4c7;
            text-decoration: none;
            font-size: 14px;
          }

          .connectButton,
          .walletButton {
            border: 0;
            border-radius: 12px;
            padding: 12px 18px;
            color: white;
            font-weight: 700;
            cursor: pointer;
          }

          .connectButton {
            background: linear-gradient(135deg, #655cff, #00bfa5);
          }

          .walletButton {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }

          .hero {
            width: 100%;
            max-width: 1240px;
            margin: auto;
            min-height: 620px;
            padding: 85px 28px;
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            align-items: center;
            gap: 50px;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.04);
            border-radius: 100px;
            color: #aeb5ca;
            font-size: 11px;
            letter-spacing: 1px;
            font-weight: 700;
          }

          .dot,
          .live i {
            width: 7px;
            height: 7px;
            display: inline-block;
            border-radius: 50%;
            background: #22d3a7;
          }

          h1 {
            font-size: clamp(50px, 7vw, 86px);
            line-height: 0.98;
            letter-spacing: -4px;
            margin: 25px 0;
          }

          h1 span {
            background: linear-gradient(90deg, #7b72ff, #00d9b5);
            -webkit-background-clip: text;
            color: transparent;
          }

          .heroText {
            color: #9299ad;
            font-size: 17px;
            line-height: 1.8;
            max-width: 650px;
          }

          .heroButtons {
            display: flex;
            gap: 13px;
            margin-top: 30px;
            flex-wrap: wrap;
          }

          .primaryButton,
          .secondaryButton {
            padding: 15px 22px;
            border-radius: 13px;
            text-decoration: none;
            font-weight: 800;
            cursor: pointer;
          }

          .primaryButton {
            border: none;
            color: white;
            background: linear-gradient(135deg, #6b61ff, #00c7a8);
          }

          .secondaryButton {
            color: #d9dce7;
            border: 1px solid rgba(255, 255, 255, 0.13);
            background: rgba(255, 255, 255, 0.04);
          }

          .statusBox {
            margin-top: 18px;
            padding: 12px 15px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            color: #aeb5c7;
            font-size: 13px;
          }

          .heroVisual {
            min-height: 430px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .orb {
            width: 330px;
            height: 330px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            background:
              radial-gradient(
                circle,
                rgba(255, 255, 255, 0.16),
                rgba(100, 90, 255, 0.12) 40%,
                transparent 70%
              );
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow:
              0 0 100px rgba(91, 82, 255, 0.18),
              inset 0 0 70px rgba(0, 215, 175, 0.08);
          }

          .orbInner {
            width: 190px;
            height: 190px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(145deg, #24235a, #071b25);
            border: 1px solid rgba(255, 255, 255, 0.16);
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
          }

          .arcText {
            font-size: 35px;
            font-weight: 900;
            letter-spacing: 4px;
          }

          .usdcText {
            color: #00d5b1;
            margin-top: 5px;
            font-size: 12px;
            letter-spacing: 4px;
          }

          .floatingCard {
            position: absolute;
            padding: 16px 20px;
            border-radius: 15px;
            background: rgba(15, 18, 32, 0.88);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(15px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }

          .floatingCard span {
            display: block;
            color: #777f94;
            font-size: 11px;
            margin-bottom: 5px;
          }

          .floatingCard strong {
            font-size: 14px;
          }

          .cardOne {
            top: 55px;
            left: 10px;
          }

          .cardTwo {
            right: 5px;
            bottom: 65px;
          }

          .stats {
            max-width: 1184px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .stats > div {
            padding: 25px;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
          }

          .stats span {
            display: block;
            color: #70788e;
            font-size: 10px;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }

          .stats strong {
            font-size: 18px;
          }

          .live {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .features,
          .workflow {
            max-width: 1184px;
            margin: auto;
            padding: 110px 28px;
          }

          .sectionHeading {
            max-width: 700px;
            margin-bottom: 45px;
          }

          h2 {
            font-size: clamp(36px, 5vw, 58px);
            line-height: 1.05;
            letter-spacing: -2px;
            margin: 18px 0;
          }

          .sectionHeading p,
          .workflowText p {
            color: #8e95a9;
            line-height: 1.7;
          }

          .featureGrid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }

          .featureCard {
            min-height: 245px;
            padding: 28px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .featureIcon {
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: rgba(105, 95, 255, 0.14);
            color: #8f88ff;
            font-size: 21px;
          }

          .featureCard h3 {
            margin-top: 28px;
            font-size: 18px;
          }

          .featureCard p {
            color: #7f879b;
            font-size: 14px;
            line-height: 1.7;
          }

          .workflow {
            display: grid;
            grid-template-columns: 0.8fr 1.2fr;
            gap: 80px;
          }

          .steps {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          .step {
            display: flex;
            gap: 22px;
            padding: 22px;
            border-radius: 15px;
            background: rgba(255, 255, 255, 0.035);
            border: 1px solid rgba(255, 255, 255, 0.07);
          }

          .step > span {
            color: #6e67ff;
            font-weight: 900;
          }

          .step h3 {
            margin: 0 0 6px;
          }

          .step p {
            margin: 0;
            color: #7f879b;
            font-size: 14px;
          }

          footer {
            max-width: 1184px;
            margin: auto;
            padding: 35px 28px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            justify-content: space-between;
            color: #737b90;
          }

          footer strong {
            color: white;
            margin-right: 12px;
          }

          .footerRight {
            font-size: 13px;
          }

          @media (max-width: 900px) {
            .navActions a {
              display: none;
            }

            .hero {
              grid-template-columns: 1fr;
              padding-top: 60px;
            }

            .heroVisual {
              min-height: 350px;
            }

            .stats,
            .featureGrid {
              grid-template-columns: repeat(2, 1fr);
            }

            .workflow {
              grid-template-columns: 1fr;
              gap: 35px;
            }
          }

          @media (max-width: 600px) {
            .navbar {
              padding: 16px;
            }

            .brandSub {
              display: none;
            }

            .connectButton {
              padding: 10px 12px;
              font-size: 12px;
            }

            .hero {
              padding: 55px 18px;
            }

            h1 {
              font-size: 52px;
              letter-spacing: -3px;
            }

            .heroText {
              font-size: 15px;
            }

            .orb {
              width: 270px;
              height: 270px;
            }

            .orbInner {
              width: 155px;
              height: 155px;
            }

            .cardOne {
              left: 0;
            }

            .cardTwo {
              right: 0;
            }

            .stats,
            .featureGrid {
              grid-template-columns: 1fr;
            }

            .stats > div {
              border-right: 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }

            .features,
            .workflow {
              padding: 75px 18px;
            }

            footer {
              flex-direction: column;
              gap: 15px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
