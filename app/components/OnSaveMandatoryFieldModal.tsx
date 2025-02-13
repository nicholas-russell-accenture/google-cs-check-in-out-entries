/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
import React, { useState, useEffect, startTransition } from 'react';
import {
  ButtonGroup,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "@contentstack/venus-components";
 
// Define an interface for the props
interface OnSaveMandatoryFieldProps {
  closeModal: () => void;
}
/**
 * 
 * @returns 
 */
const fetchAudienceData = async () => {
  const urlAudience = `https://api.contentstack.io/v3/global_fields/sdp_audience`;
  try{
    const response = await fetch(urlAudience, {
      method: 'GET',
      headers: {
        'api_key': 'blte7c3fb6302682736',
        'authorization': 'csf48ce29f60c6089af332d867',
        'Content-Type': 'application/json',
        'branch': 'main'
      },
    });
    let res;
    if (response?.ok) {
      res = response.json();
    }
    return res;
  }catch (e){
    console.log("Fetch Error :",e);
  }
  
};

const OnSaveMandatoryFieldModal: React.FC<OnSaveMandatoryFieldProps> = (props) => {
  const { closeModal } = props;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [audienceData, setAudienceData] = useState<any | null>(null);
  const [selectedAudience, setSelectedAudience] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
   
  // Fetch audience data on mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAudienceData();
      console.log("data : ",data?.global_field);
      startTransition(() => {
        setAudienceData(data?.global_field);
      });
    };
 
    fetchData();
  }, []); // Empty dependency array means this runs once when the component mounts
  /**
   * Onsubmit assign the value to audience field
   */
  const handleSubmit = () => {
    // Logic to assign selectedValue to Contentstack Select field
    // This may involve API calls or other methods depending on your setup
    console.log("handleSubmit selectedAudience :",selectedAudience);
    closeModal(); // close model on continue
  };
  if (!audienceData) {
    return <div>Loading...</div>; // You can show a loading spinner or message here
  }
 // Handler function to update state
  const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    const value = event.target.value;
    setSelectedAudience(value);
    setIsButtonDisabled(value === ''); // Disable if no value is selected
  };
  return (
    <>
      <ModalHeader title="Audience Selection" />
      <ModalBody className="modalBodyCustomClass">
        <div>
           <p>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
              <h3>Please select an Audience Value for This Entry.</h3>
              {/*audienceData?.schema[0]?.display_name */}
            </label>
            <select id="audience" className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAudience} onChange={handleChange}>
              <option value="">Click to select options</option>
              {audienceData?.schema[0]?.enum?.choices.map((audience:any) => (
                <option key={audience.value} value={audience.value}>
                  {audience.value}
                </option>
              ))}
            </select>
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button buttonType="secondary" onClick={() => handleSubmit()}
          disabled={isButtonDisabled}  >
            Continue
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};
 
 
export default OnSaveMandatoryFieldModal;