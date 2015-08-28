class CrimeEntry < ActiveRecord::Base

    @cta_processor = Tally.new

    def self.getData
    	# Get data using the SODA API
    	require 'soda/client'
        require 'tally'
        client = SODA::Client.new({:domain => 'data.cityofchicago.org', :app_token => Rails.application.secrets.soda_app_token})
        response = client.get("qnmj-8ku6", {"$limit" => 10000, "$q" => "CTA"})
        return response
    end

    def self.getCrimeResults()
    	# Simply calls the getData method and returns the results
    	pre_filtered_data = self.getData()
        crimes_filtered = @cta_processor.filter_cta_entries(pre_filtered_data)
        sorted_filtered_crimes = @cta_processor.sorter(crimes_filtered, "asc", "date")
        return sorted_filtered_crimes
    end

    def self.get_tally_breakdown()
    	# Get the crime tally
    	data_to_tally = self.getCrimeResults()
    	return @cta_processor.tally_subtypes(data_to_tally)
    end

end
