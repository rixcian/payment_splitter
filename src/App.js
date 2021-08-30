import {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import { Box, Container, Flex } from '@chakra-ui/layout';
import {
  FormControl,
  FormLabel,
  Heading,
  Input,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton
} from "@chakra-ui/react";
import { AddIcon } from '@chakra-ui/icons';
import PaymentSplitter from './artifacts/contracts/PaymentSplitter.sol/PaymentSplitter.json';

import './App.css';

const splitterAddress = "0xB251b2C42A0df2b34F658809e8fb9Ec2D6607742";

const App = () => {

  const [amount, setAmount] = useState(1.00000);
  const [recipients, setRecipients] = useState([{address: "", share: 100}]);
  const [showPercentageError, setShowPercentageError] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const sendPayment = async () => {
    if (amount === 0) return;
    if (recipients.map(recipient => recipient.address).includes("")) return;

    setPaymentLoading(true);
    if (typeof window.ethereum !== 'undefined') {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(splitterAddress, PaymentSplitter.abi, signer);
        const tx = await contract.splitPayment(
          recipients.map(recipient => recipient.address),
          recipients.map(recipient => parseInt(recipient.share)),
          {value: ethers.utils.parseEther(amount.toString())}
        );

        const finishedTx = await tx.wait();

        console.log(`https://kovan.etherscan.io/tx/${finishedTx.transactionHash}`);
        console.log(`Gas Used: ${finishedTx.gasUsed}`);

        setPaymentLoading(false);
      } catch (err) {
        console.log(`Error: ${err}`);
        setPaymentLoading(false);
      }
    }
  }

  useEffect(() => {
    const summary = recipients.reduce((prev, curr) => {
      return {
        address: "",
        share: parseInt(prev.share) + parseInt(curr.share)
      };
    });
    setShowPercentageError(parseInt(summary.share) !== 100);
  }, [recipients])

  const updateRecipient = (name, value, idx) => {
    let newRecipients = [...recipients];
    let newRecipient = {...recipients[idx]};

    newRecipient[name] = value;
    newRecipients[idx] = newRecipient;

    setRecipients(newRecipients);
  }

  const addRecipient = () => setRecipients([...recipients, {address: "", share: 1}]);

  const removeRecipient = (idx) => recipients.length > 1 && setRecipients(prevState => prevState.filter((_, rIdx) => rIdx !== idx));

  return (
    <Box
      py="10"
      w="100vw"
      h="100vh"
      bgGradient="linear(60deg, #29323c 0%, #485563 100%)"
    >
      <Container>
        <Box bg="white" color="black" p="7" borderRadius="md">
          <Heading as="h3" mb="10">Payment Splitter v0.1.0</Heading>
          <FormControl id="amount" mb="5">
            <FormLabel>Amount (ETH)</FormLabel>
            <NumberInput defaultValue={1} precision={5} min={0} step={0.5} onChange={(_, val) => setAmount(val)}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl id="recipients">
            <FormLabel>
              <p>Recipients (Address, Share in percents)</p>
            </FormLabel>
            {
              recipients.map((recipient, idx) => (
                <Flex key={idx} mb="2" alignItems="center">
                  <Input w="60%" mr="5" value={recipient.address} placeholder="Address" onChange={(e) => updateRecipient("address", e.target.value, idx)}/>
                  <NumberInput w="25%" value={recipient.share} min={1} max={100} onChange={val => updateRecipient("share", val, idx)}>
                    <NumberInputField  id="share" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <CloseButton w="10%" onClick={() => removeRecipient(idx)}/>
                </Flex>
              ))
            }
          </FormControl>

          <Button colorScheme="blue" variant="outline" size="md" w="100%" mt="2" mb="10" onClick={addRecipient}>
            <AddIcon mr="3" />
            Add Recipient
          </Button>

          {showPercentageError && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>The summary of percentages doesn't equal to 100!</AlertTitle>
            </Alert>
          )}

          <Button colorScheme="blue" variant="solid" isLoading={paymentLoading} disabled={showPercentageError} size="lg" w="100%" mt="3" onClick={sendPayment}>
            Send
          </Button>

        </Box>
      </Container>
    </Box>
  );
}

export default App;
