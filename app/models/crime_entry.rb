class CrimeEntry < ActiveRecord::Base

    def self.getData
    	# Get data using the SODA API
    	require 'soda/client'
        client = SODA::Client.new({:domain => 'data.cityofchicago.org', :app_token => Rails.application.secrets.soda_app_token})
        response = client.get("qnmj-8ku6", {"$limit" => 10000, "$q" => "CTA"})
        crimes_filtered = CrimeEntry.filter_cta_entries(response)
        return crimes_filtered
    end

    def self.getCrimeResults()
    	# Simply calls the getData method and returns the results
        return self.getData()
    end

    def self.filter_cta_entries(dataset)
    	# Get public area crimes (buses and trains) only
        public_crimes = Array.new
        dataset.each do |crime|
            location = crime.location_description.downcase
            if  location.include?("platform") || 
                location.include?("train") || 
                location.include?("bus") || 
                location.include?("stop")
                    public_crimes.push(crime)
            end
        end
        return public_crimes
    end

end
