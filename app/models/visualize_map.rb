class VisualizeMap < ActiveRecord::Base

	def self.getData
    	# Get XML data by intepreting KML file
        require 'nokogiri'
        require 'json'
        file = File.join(Rails.root, 'public', 'CTARailLines.kml')
        f = File.open(file)
		doc = Nokogiri::XML(f)
		test = self.parseKML(doc)
        return doc
    end

    def self.parseKML(xml_doc)
    	# Parse the KML file
    	require 'nokogiri'
    	converted = xml_doc.xpath('//CTA:kml', 'CTA' => 'http://www.opengis.net/kml/2.2')
    	document = xml_doc.xpath('//CTA:Document', 'CTA' => 'http://www.opengis.net/kml/2.2')
    	folder = document.xpath('//CTA:Folder', 'CTA' => 'http://www.opengis.net/kml/2.2')
    	placemarks = folder.xpath('//CTA:Placemark', 'CTA' => 'http://www.opengis.net/kml/2.2')
    	puts "converting"
    	placemarks.each do |x|
    		puts "---------"
    		puts x
    		puts "---------"
    	end
    	puts "done with conversion"
    	puts "_________________"
    	return converted
    end

end
