class CrimeEntry < ActiveRecord::Base

    def self.getData
    	# Get data using the SODA API
    	require 'soda/client'
        client = SODA::Client.new({:domain => 'data.cityofchicago.org', :app_token => Rails.application.secrets.soda_app_token})
        response = client.get("qnmj-8ku6", {"$limit" => 10000, "$q" => "CTA"})
        crimes_filtered = CrimeEntry.filter_cta_entries(response)
        sorted_filtered_crimes = crimes_filtered.sort! { |x,y| x["date"] <=> y["date"] }
        return sorted_filtered_crimes
    end

    def self.getCrimeResults()
    	# Simply calls the getData method and returns the results
    	filtered_data = self.getData()
        return filtered_data
    end

    def self.get_tally()
    	# Get the crime tally
    	data_to_tally = self.getData()
    	return self.tally_crimes_by_type(data_to_tally)
    end

    def self.get_tally_breakdown()
    	# Get the crime tally
    	data_to_tally = self.getData()
    	return self.tally_crimes_including_description(data_to_tally)
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

    def self.tally_crimes_by_type(dataset)
    	# Tally the crimes according to type for presentation
    	crimes = Hash.new
    	crimes_array = Array.new
    	dataset.each do |crime|
    		primary_type = crime.primary_type
    		key_check = crimes.has_key?(primary_type)
            if !key_check
            	new_tally = Hash.new
            	new_tally["type"] = primary_type
            	new_tally["count"] = 1
            	crimes[primary_type] = new_tally
            else
            	existing_tally = crimes[primary_type]
            	existing_count = existing_tally["count"]
            	existing_tally["count"] = existing_count + 1
            	# Update entry
            	crimes[primary_type] = existing_tally
            end
        end
        crimes.each do |key, entry|
        	crimes_array.push(entry) 
        end
        # Sort the list in descending order
        sorted_by_count = crimes_array.sort! { |x,y| y["count"] <=> x["count"] }
        # return the sorted crimes array for easy iteration, key from original
        # hash no longer needed
        return sorted_by_count
    end

    def self.tally_crimes_including_description(dataset)
    	# Tally the crimes according to type for presentation
    	crimes = Hash.new
    	dataset.each do |crime|
    		primary_type = crime.primary_type
    		key_check = crimes.has_key?(primary_type)
            if !key_check
            	# If primary type doesn't exist in crime hash
            	new_tally = Hash.new
            	new_tally["name"] = primary_type
            	new_tally["sub_types"] = Hash.new
            	# Check if crime with description (sub-type) exists, and
            	# create it at the same time if it doesn't (this will always
            	# happen with a new primary type)
				sub_type = crime.description
				sub_type_key_check = new_tally["sub_types"].has_key?(sub_type)
				if !sub_type_key_check
					new_sub_type_hash = Hash.new
					new_sub_type_hash["name"] = sub_type
					new_sub_type_hash["count"] = 1
					new_tally["sub_types"][sub_type] = new_sub_type_hash
				end
            	crimes[primary_type] = new_tally
            else
            	# Add new sub-types to primary types if the primary type already exists
            	sub_type = crime.description
            	existing_tally = crimes[primary_type]
				sub_type_key_check = existing_tally["sub_types"].has_key?(sub_type)
				if !sub_type_key_check
					new_sub_type_hash = Hash.new
					new_sub_type_hash["name"] = sub_type
					new_sub_type_hash["count"] = 1
					existing_tally["sub_types"][sub_type] = new_sub_type_hash
				else
					existing_tally["sub_types"][sub_type]["count"] += 1
				end
            end
        end
        return crimes
    end

end
