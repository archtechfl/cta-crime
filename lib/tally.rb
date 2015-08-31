class Tally
	# Contains all the methods for sorting and tallying records
	def filter_cta_entries(records)
		puts "enter filter"
    	# Get public area crimes (buses and trains) only
        public_crimes = Array.new
        records.each do |crime|
            location = crime.location_description.downcase
            if  location.include?("platform") || 
                location.include?("train") || 
                location.include?("bus") || 
                location.include?("stop")
                    public_crimes.push(crime)
            end
        end
        puts "exit filter"
        return public_crimes
    end
    def sorter(data, direction, key)
    	puts "enter sorter"
    	# Sort an array of hashes based on a property of each hash
    	if direction == "desc"
    		sorted = data.sort! { |x,y| y[key] <=> x[key] }
    	else
    		sorted = data.sort! { |x,y| x[key] <=> y[key] }
    	end
    	puts "exit sorter"
    	return sorted
    end
    def tally_subtypes(data)
    	# Tally the crimes according to type for presentation
    	puts "enter tally_subtypes"
    	crimes = Hash.new
    	data.each do |crime|
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
        puts "exit tally_subtypes"
        return crimes
    end
end