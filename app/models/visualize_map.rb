class VisualizeMap < ActiveRecord::Base

	def self.getData
    	# Get XML data by intepreting KML file
        require 'nokogirl'
        file = File.join(Rails.root, 'public', 'CTARailLines.kml')
        f = File.open(file)
		doc = Nokogiri::XML(f)
		f.close
        return doc
    end

end
