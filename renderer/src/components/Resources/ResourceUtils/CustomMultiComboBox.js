import React, { useState } from 'react';
import { Combobox } from '@headlessui/react';
import PropTypes from 'prop-types';

function CustomMultiComboBox({
  selectedList, setSelectedList, customData, filterParams = 'name',
}) {
  let filteredData = [];
  const [query, setQuery] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [isActive, setIsActive] = useState(false);
  if (customData.length === 1) {
    setSelectedList(customData);
  } else if (customData.length > 1) {
    // eslint-disable-next-line no-nested-ternary
    filteredData = (query === '')
      ? customData.slice(0, 100).concat(selectedList.filter((item) => customData.slice(0, 100).indexOf(item) === -1)) // showing initial 100
      : (query.length >= 3)
        ? customData.filter((data) => data[filterParams].toLowerCase().includes(query.toLowerCase()))
        : [];
  }

  return (
      customData.length > 1 ? (
        <Combobox value={selectedList} onChange={setSelectedList} multiple>
          {({ open }) => (
            <div className="relative">
              <div className="relative w-full border border-gray-200 cursor-default overflow-hidden rounded-lg bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">

                <Combobox.Input
                  className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                  displayValue={(language) => language?.ang}
                  placeholder={`${selectedList.length > 0 ? `${selectedList[0][filterParams]}... click for more` : 'Select Language'}`}
                  onFocus={() => !open && setIsActive(true)}
                  onBlur={() => setIsActive(false)}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <Combobox.Options className="absolute w-full z-40 mt-1 max-h-48 scrollbars-width overflow-auto rounded-md bg-white py-1 px-2 text-base shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm cursor-pointer">
                <div className="flex-col">
                  <div>
                    {selectedList.length > 0 && !query.length > 0 && <div className="mt-1 mb-2 h-[.1rem] w-full bg-secondary" />}
                    {filteredData.map((data) => (
                      // <Combobox.Option key={data?.id || data?.pk} className={`${selectedList.includes(data) ? 'bg-gray-400' : ''} hover:bg-gray-300 p-1`} value={data}>
                      <Combobox.Option key={data?.id || data?.pk} className=" hover:bg-gray-300 p-1" value={data}>
                        {data[filterParams]}
                      </Combobox.Option>
                    ))}
                  </div>
                </div>
              </Combobox.Options>
              {/* selected list */}
            </div>
          )}
        </Combobox>
      ) : (
        // only one item in dropdown
        <div className="relative">
          <div className="relative w-full border border-gray-200 cursor-default overflow-hidden rounded-lg bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <input
              type="text"
              value={customData[0][filterParams]}
              disabled
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 bg-gray-100 text-gray-900 focus:ring-0"
            />
          </div>
        </div>
      )
  );
}

CustomMultiComboBox.propTypes = {
  selectedList: PropTypes.array,
  customData: PropTypes.array,
  filterParams: PropTypes.string,
  setSelectedList: PropTypes.func,
};

export default CustomMultiComboBox;
