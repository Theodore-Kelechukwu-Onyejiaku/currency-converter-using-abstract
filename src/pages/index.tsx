import React, { ReactElement, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { currencies } from '@/assets/currencies'
import convertIcon from "../assets/images/convert.jpg"
import loadingIcon from "../assets/images/loading.gif"

interface Currency {
  short: string,
  long: string
}
function Currencies({ currencies, choice }: { currencies: Currency[], choice: string }): ReactElement {
  return (
    <>
      {currencies.map((currency: Currency) => (
        <option key={currency.short} selected={currency.short === choice ? true : false} value={currency.short}>
          {"("}{currency.short}{") "}{currency.long}
        </option>
      ))}
    </>
  )
}

export default function Home() {
  interface Rates {
    base: string,
    target: string
  }
  const [rates, setRates] = useState<{ base: string, target: string }>({ target: "", base: "" })
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")


  const fromSelectRef = useRef<HTMLSelectElement | null>(null)
  const toSelectRef = useRef<HTMLSelectElement | null>(null)
  const handleSubmit = async () => {
    try {
      setError("")
      setLoading(true)
      const baseCurrency = fromSelectRef.current?.value
      const targetCurrency = toSelectRef.current?.value
      let result: any;
      console.log(baseCurrency, targetCurrency)
      result = await fetch(`https://exchange-rates.abstractapi.com/v1/live/?api_key=${process.env.NEXT_PUBLIC_ABSTRACT_API_KEY}&base=${baseCurrency}&target=${targetCurrency}`)

      result = await result.json();
      console.log(result)
      const { error, base, exchange_rates } = result;
      if (error) {
        setLoading(false)
        return setError(error?.message + " Please try again")
      }
      setRates({ "target": targetCurrency as string, "base": baseCurrency as string })
      setResult(exchange_rates[`${targetCurrency}`])
      setLoading(false)
    } catch (error: any) {
      setError(error?.message)
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Currency Converter</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='wave-bg'>
        <div className='mx-5 h-screen flex flex-col justify-center items-center'>
          <div>
            <Image width={150} height={40} src={convertIcon} className="rounded-full" alt="conversion" />
          </div>
          <h1 className='text-3xl font-bold'>Currency Rate Calculator</h1>
          <div className='w-96 p-5'>

            <div className='my-3'>
              <label>From:</label>
              <select ref={fromSelectRef} className='p-4 border w-full rounded-md'>
                <Currencies choice='EUR' currencies={currencies} />
              </select>
            </div>
            <div className='my-3'>
              <label>To:</label>
              <select ref={toSelectRef} className='p-4 border w-full rounded-md'>
                <Currencies choice="GBP" currencies={currencies} />
              </select>
            </div>
            <button disabled={loading} onClick={handleSubmit} className='p-3 shadow-md w-20 my-3'>Convert</button>
          </div>
          <div className='h-32'>
            {error ? <div className='flex flex-col text-center my-2 w-96'>
              <span className='text-4xl text-slate-400'>Ooops</span>
              <span className='text-red-400'>{error}</span>
            </div> :
              loading ? <Image width={150} height={40} src={loadingIcon} className="rounded-full" alt="conversion" />
                :
                result ? <span className='font-bold'>1 {rates.base} = {" "} {result} {rates.target}</span> : null
            }
          </div>
        </div>
      </div>
    </>
  )
}
