/* eslint-disable @typescript-eslint/no-unused-vars */
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
interface OnSaveMandatoryFieldProps {
  closeModal: () => void;
  appSdk: any; 
}
const OnSaveMandatoryFieldModal: React.FC<OnSaveMandatoryFieldProps> = (props) => {
  const { closeModal } = props;
  const appSdk = props.appSdk;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [audienceData, setAudienceData] = useState<any | null>(null);
  const [selectedAudience, setSelectedAudience] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  console.log("OnSaveMandatoryFieldModal start appSdk?.location? :", appSdk?.location?.CustomField);

  const audienceOptions = [
    { value: 'Googlers', label: 'Googlers' },
    { value: 'Resolvers', label: 'Resolvers' },
    // Add more options as needed
  ];
  // set audience options data on mount
  useEffect(() => {
    setAudienceData(audienceOptions);
  }, []); // Empty dependency array means this runs once when the component mounts
  /**
   * Onsubmit assign the value to audience field
   */
  const handleSubmit = () => {
    // Logic to assign selectedValue to Contentstack Select field
    console.log("handleSubmit selectedAudience :", selectedAudience);
    appSdk?.location?.CustomField?.field?.setData(selectedAudience)
     const entry = appSdk.location.CustomField.entry; // Access the entry object
    if(appSdk?.location?.CustomField?.entry._data.uid){
      const audienceField = entry.getField('sdp_article_audience.sdp_audience'); // Retrieve the specific field
       // Set the new value for the sdp_audience field
        audienceField.setData(selectedAudience);
    }
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
      <ModalBody className="modalBodyCustomClass" >
        <div>
           <p>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
             <span className="not-bold">Select the main audience for your article. Select Googlers for articles meant for all Googlers and Resolvers for articles meant for technicians only.</span>
              {/*audienceData?.schema[0]?.display_name */}
            </label>
            <select id="audience" className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAudience} onChange={handleChange}>
              <option value="" selected disabled hidden>Click to select options</option>
              {audienceOptions.map((audience:any) => (
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